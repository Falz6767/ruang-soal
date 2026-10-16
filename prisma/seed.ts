import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const examples = [
  {
    id: "contoh-k1-matematika", grade: 1, subject: "Matematika", topic: "Penjumlahan", type: "PILIHAN_GANDA",
    text: "Ibu mempunyai 3 apel. Ayah memberi 2 apel lagi. Berapa jumlah apel sekarang?",
    options: ["3 apel", "4 apel", "5 apel", "6 apel"], answer: "C",
    explanation: "Jumlah apel adalah 3 + 2 = 5 apel.",
  },
  {
    id: "contoh-k1-bahasa", grade: 1, subject: "Bahasa Indonesia", topic: "Huruf vokal", type: "ISIAN_SINGKAT",
    text: "Tuliskan huruf vokal pertama pada kata ‘ikan’.", options: [], answer: "i",
    explanation: "Kata ‘ikan’ dimulai dengan huruf vokal i.",
  },
  {
    id: "contoh-k2-matematika", grade: 2, subject: "Matematika", topic: "Perkalian", type: "PILIHAN_GANDA",
    text: "Ada 4 piring. Setiap piring berisi 3 kue. Berapa jumlah seluruh kue?",
    options: ["7 kue", "10 kue", "12 kue", "14 kue"], answer: "C",
    explanation: "Empat kelompok yang masing-masing berisi tiga kue sama dengan 4 × 3 = 12 kue.",
  },
  {
    id: "contoh-k2-pancasila", grade: 2, subject: "Pendidikan Pancasila", topic: "Gotong royong", type: "URAIAN",
    text: "Tuliskan dua contoh kegiatan gotong royong di sekolah.", options: [],
    answer: "Contoh: membersihkan kelas bersama dan merawat taman sekolah bersama.",
    explanation: "Jawaban lain dapat diterima apabila menunjukkan kerja sama untuk kepentingan bersama.",
  },
  {
    id: "contoh-k3-ipas", grade: 3, subject: "IPAS", topic: "Bagian tumbuhan", type: "PILIHAN_GANDA",
    text: "Bagian tumbuhan yang menyerap air dan zat hara dari tanah adalah ….",
    options: ["Daun", "Bunga", "Buah", "Akar"], answer: "D",
    explanation: "Akar menyerap air dan zat hara dari dalam tanah.",
  },
  {
    id: "contoh-k3-bahasa", grade: 3, subject: "Bahasa Indonesia", topic: "Lawan kata", type: "ISIAN_SINGKAT",
    text: "Lawan kata ‘panjang’ adalah ….", options: [], answer: "pendek",
    explanation: "Panjang dan pendek merupakan pasangan kata yang berlawanan makna.",
  },
  {
    id: "contoh-k4-matematika", grade: 4, subject: "Matematika", topic: "Pecahan", type: "PILIHAN_GANDA",
    text: "Pecahan yang senilai dengan 1/2 adalah ….",
    options: ["1/4", "2/4", "2/3", "3/4"], answer: "B",
    explanation: "Pembilang dan penyebut dikalikan dua: 1/2 = 2/4.",
  },
  {
    id: "contoh-k4-ipas", grade: 4, subject: "IPAS", topic: "Perubahan wujud", type: "URAIAN",
    text: "Es batu yang diletakkan di meja akan berubah menjadi air. Jelaskan nama perubahan wujud tersebut dan penyebabnya.",
    options: [], answer: "Perubahan itu disebut mencair. Es menyerap panas dari lingkungan sehingga berubah dari padat menjadi cair.",
    explanation: "Jawaban memuat istilah mencair dan penyerapan panas dari lingkungan.",
  },
  {
    id: "contoh-k5-bahasa", grade: 5, subject: "Bahasa Indonesia", topic: "Ide pokok", type: "PILIHAN_GANDA",
    text: "Bacalah paragraf berikut.\n‘Pohon memberi banyak manfaat. Pohon menghasilkan oksigen. Akar pohon membantu menahan tanah. Daunnya membuat halaman terasa teduh.’\nApa ide pokok paragraf tersebut?",
    options: ["Akar pohon menahan tanah", "Halaman rumah terasa teduh", "Pohon memberi banyak manfaat", "Daun pohon berwarna hijau"], answer: "C",
    explanation: "Kalimat pertama menyatakan gagasan utama, sedangkan kalimat berikutnya menjelaskan manfaat pohon.",
  },
  {
    id: "contoh-k5-matematika", grade: 5, subject: "Matematika", topic: "Volume kubus", type: "ISIAN_SINGKAT",
    text: "Sebuah kubus memiliki panjang rusuk 4 cm. Berapa volume kubus tersebut? Tuliskan satuannya.",
    options: [], answer: "64 cm³", explanation: "Volume kubus = rusuk × rusuk × rusuk = 4 × 4 × 4 = 64 cm³.",
  },
  {
    id: "contoh-k6-ipas", grade: 6, subject: "IPAS", topic: "Tata surya", type: "PILIHAN_GANDA",
    text: "Planet yang paling dekat dengan Matahari adalah ….",
    options: ["Venus", "Bumi", "Mars", "Merkurius"], answer: "D",
    explanation: "Merkurius merupakan planet dengan orbit paling dekat dengan Matahari.",
  },
  {
    id: "contoh-k6-pancasila", grade: 6, subject: "Pendidikan Pancasila", topic: "Musyawarah", type: "URAIAN",
    text: "Saat musyawarah kelas, pendapatmu berbeda dengan pendapat teman. Bagaimana sikap yang sebaiknya kamu tunjukkan? Jelaskan dua tindakan.",
    options: [], answer: "Mendengarkan pendapat teman dengan hormat, menyampaikan alasan secara santun, dan menerima keputusan bersama dengan tanggung jawab. Cukup jelaskan dua tindakan yang sesuai.",
    explanation: "Nilai jawaban berdasarkan sikap saling menghargai, santun, serta tanggung jawab terhadap keputusan bersama.",
  },
];

async function main() {
  let created = 0;
  for (const example of examples) {
    const exists = await prisma.question.findUnique({ where: { id: example.id }, select: { id: true } });
    if (!exists) created += 1;
    await prisma.question.upsert({
      where: { id: example.id },
      update: {},
      create: { ...example, options: JSON.stringify(example.options), isExample: true },
    });
  }
  console.log(`Seed selesai: ${created} soal contoh ditambahkan. Soal yang sudah ada tidak diubah.`);
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => { await prisma.$disconnect(); });
