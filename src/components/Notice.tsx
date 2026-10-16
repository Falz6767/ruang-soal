export default function Notice({ message }: { message?: string }) {
  return message ? <p className="alert alert-success no-print" role="status">{message.slice(0, 300)}</p> : null;
}
