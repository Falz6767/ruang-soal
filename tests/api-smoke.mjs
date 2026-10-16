import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const baseUrl = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const tag = `Uji otomatis ${randomUUID()}`;
const questionIds = new Set();
const worksheetIds = new Set();
let checks = 0;

async function request(path, { method = "GET", body, rawBody, statuses = [200], expectedField } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body !== undefined || rawBody !== undefined ? { "Content-Type": "application/json" } : {},
    body: rawBody ?? (body !== undefined ? JSON.stringify(body) : undefined),
    signal: AbortSignal.timeout(15_000),
  });
  const raw = await response.text();
  let result;
  try {
    result = raw ? JSON.parse(raw) : null;
  } catch {
    assert.fail(`${method} ${path}: respons bukan JSON (${response.status}): ${raw.slice(0, 300)}`);
  }
  // Catat juga ID apabila server keliru menerima input yang seharusnya ditolak.
  if (method === "POST" && response.ok && typeof result?.data?.id === "string") {
    if (path === "/api/soal") questionIds.add(result.data.id);
    if (path === "/api/lembar") worksheetIds.add(result.data.id);
  }
  assert.ok(
    statuses.includes(response.status),
    `${method} ${path}: status ${response.status}, diharapkan ${statuses.join("/")}; ${raw.slice(0, 500)}`,
  );
  if (response.status >= 400) {
    assert.equal(typeof result?.error, "string", `${method} ${path}: pesan error harus tersedia`);
    assert.ok(result.error.length > 0);
  }
  if (expectedField) assert.equal(typeof result?.fields?.[expectedField], "string", `Pesan validasi kolom ${expectedField} harus tersedia`);
  checks += 1;
  return result?.data;
}

async function createQuestion(body) {
  const question = await request("/api/soal", { method: "POST", body, statuses: [201] });
  assert.equal(typeof question.id, "string");
  questionIds.add(question.id);
  return question;
}

function questionInput(question) {
  return {
    grade: question.grade,
    subject: question.subject,
    topic: question.topic ?? "",
    type: question.type,
    text: question.text,
    options: question.options,
    answer: question.answer,
    explanation: question.explanation ?? "",
  };
}

async function expectPage(path, phrases, absentPhrases = []) {
  const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(15_000) });
  assert.equal(response.status, 200, `Halaman ${path} harus dapat dibuka`);
  const html = await response.text();
  for (const phrase of phrases) assert.ok(html.includes(phrase), `Halaman ${path} tidak memuat "${phrase}"`);
  for (const phrase of absentPhrases) assert.ok(!html.includes(phrase), `Halaman ${path} tidak boleh memuat kunci "${phrase}"`);
  checks += 1;
}

try {
  console.log(`Menguji Ruang Soal di ${baseUrl} ...`);
  const common = { grade: 4, subject: tag, topic: "Integrasi API", explanation: "Pembahasan untuk pengujian otomatis." };
  const pg = await createQuestion({
    ...common,
    type: "PILIHAN_GANDA",
    text: `${tag}: Berapakah hasil 4 × 3?`,
    options: ["7", "12", "16", "43"],
    answer: "B",
  });
  const short = await createQuestion({
    ...common,
    grade: 2,
    type: "ISIAN_SINGKAT",
    text: `${tag}: Banyak hari dalam satu minggu adalah ...`,
    options: [],
    answer: "Tujuh hari",
  });
  const essay = await createQuestion({
    ...common,
    type: "URAIAN",
    text: `${tag}: Jelaskan dua cara menghemat air.`,
    options: [],
    answer: "Menutup keran setelah digunakan dan menggunakan air secukupnya.",
  });

  await request("/api/soal", { method: "POST", body: { ...questionInput(pg), grade: 7 }, statuses: [400], expectedField: "grade" });
  await request("/api/soal", { method: "POST", body: { ...questionInput(pg), answer: "E" }, statuses: [400], expectedField: "answer" });
  await request("/api/soal", { method: "POST", body: { ...questionInput(pg), options: ["A", "B", "C"] }, statuses: [400], expectedField: "options" });
  await request("/api/soal", { method: "POST", body: { ...questionInput(pg), options: ["7", "12", "12", "43"] }, statuses: [400], expectedField: "options" });
  await request("/api/soal", { method: "POST", body: { ...questionInput(short), text: "   " }, statuses: [400], expectedField: "text" });
  await request("/api/soal", { method: "POST", body: { ...questionInput(short), options: ["Tidak relevan"] }, statuses: [400], expectedField: "options" });
  await request("/api/soal", { method: "POST", rawBody: "{bukan-json", statuses: [400] });
  await request("/api/soal?grade=7", { statuses: [400], expectedField: "grade" });

  const search = await request(`/api/soal?search=${encodeURIComponent(tag.toLocaleLowerCase("id"))}`);
  assert.ok(Array.isArray(search));
  assert.deepEqual(new Set(search.map((question) => question.id)), questionIds);
  const filtered = await request(`/api/soal?subject=${encodeURIComponent(tag)}&grade=4&type=PILIHAN_GANDA`);
  assert.deepEqual(filtered.map((question) => question.id), [pg.id]);
  const byGrade = await request(`/api/soal?search=${encodeURIComponent(tag)}&grade=2`);
  assert.deepEqual(byGrade.map((question) => question.id), [short.id]);
  const detail = await request(`/api/soal/${pg.id}`);
  assert.equal(detail.answer, "B");
  assert.deepEqual(detail.options, pg.options);
  await request(`/api/soal/${randomUUID()}`, { statuses: [404] });

  await request("/api/lembar", { method: "POST", body: { title: tag, instructions: "", items: [] }, statuses: [400] });
  await request("/api/lembar", {
    method: "POST",
    body: { title: tag, instructions: "", items: [{ questionId: pg.id }, { questionId: pg.id }] },
    statuses: [400],
  });
  await request("/api/lembar", {
    method: "POST",
    body: { title: tag, instructions: "", items: [{ questionId: randomUUID() }] },
    statuses: [400, 404],
  });
  const worksheet = await request("/api/lembar", {
    method: "POST",
    body: {
      title: tag,
      instructions: "Bacalah setiap soal. Kerjakan dengan teliti.",
      items: [{ questionId: pg.id }, { questionId: short.id }, { questionId: essay.id }],
    },
    statuses: [201],
  });
  worksheetIds.add(worksheet.id);
  assert.equal(worksheet.items.length, 3);
  assert.deepEqual(worksheet.items.map((item) => item.question.text), [pg.text, short.text, essay.text]);
  assert.equal(new Set(worksheet.items.map((item) => item.position)).size, 3);

  const updatedQuestion = await request(`/api/soal/${pg.id}`, {
    method: "PATCH",
    body: { ...common, type: "PILIHAN_GANDA", text: `${tag}: Teks soal bank sudah diubah.`, options: pg.options, answer: "A" },
  });
  assert.equal(updatedQuestion.answer, "A");
  const snapshot = await request(`/api/lembar/${worksheet.id}`);
  assert.equal(snapshot.items[0].question.text, pg.text, "Perubahan bank tidak boleh mengubah salinan lembar");
  assert.equal(snapshot.items[0].question.answer, "B");

  const reordered = await request(`/api/lembar/${worksheet.id}`, {
    method: "PATCH",
    body: {
      title: `${tag} revisi`,
      instructions: "Kerjakan dari nomor satu sampai selesai.",
      items: [worksheet.items[2], worksheet.items[0], worksheet.items[1]].map((item) => ({ itemId: item.id })),
    },
  });
  assert.deepEqual(reordered.items.map((item) => item.question.text), [essay.text, pg.text, short.text]);
  assert.equal(reordered.title, `${tag} revisi`);

  const removed = await request(`/api/lembar/${worksheet.id}`, {
    method: "PATCH",
    body: {
      title: reordered.title,
      instructions: reordered.instructions,
      items: reordered.items.slice(1).map((item) => ({ itemId: item.id })),
    },
  });
  assert.equal(removed.items.length, 2);
  assert.equal((await request(`/api/soal/${essay.id}`)).id, essay.id, "Menghapus item lembar tidak boleh menghapus soal bank");

  await request(`/api/soal/${pg.id}`, { method: "DELETE", statuses: [200, 204] });
  questionIds.delete(pg.id);
  await request(`/api/soal/${pg.id}`, { statuses: [404] });
  const preserved = await request(`/api/lembar/${worksheet.id}`);
  assert.equal(preserved.items.length, 2);
  assert.equal(preserved.items[0].questionId, null);
  assert.equal(preserved.items[0].question.text, pg.text, "Salinan soal harus tetap ada setelah soal bank dihapus");
  assert.equal(preserved.items[0].question.answer, "B");

  const worksheets = await request("/api/lembar");
  assert.ok(worksheets.some((item) => item.id === worksheet.id));
  await expectPage(`/lembar/${worksheet.id}/pratinjau`, ["4 × 3", "12"], ["Tujuh hari", common.explanation]);
  await expectPage(`/lembar/${worksheet.id}/pratinjau?kunci=1`, ["Tujuh hari"]);
  await request(`/api/lembar/${randomUUID()}`, { statuses: [404] });

  console.log(`LULUS: ${checks} permintaan memverifikasi CRUD, validasi, filter, urutan, salinan soal, serta pratinjau.`);
} catch (error) {
  console.error("GAGAL:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  let cleanupFailed = false;
  for (const [resource, ids] of [["lembar", worksheetIds], ["soal", questionIds]]) {
    for (const id of ids) {
      try {
        await request(`/api/${resource}/${id}`, { method: "DELETE", statuses: [200, 204, 404] });
      } catch (error) {
        cleanupFailed = true;
        console.error(`Pembersihan ${resource}/${id} gagal:`, error instanceof Error ? error.message : error);
      }
    }
  }
  if (cleanupFailed) process.exitCode = 1;
  else console.log("Data milik pengujian telah dibersihkan. Data guru tidak diubah.");
}
