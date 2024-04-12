export default function Activate({
  email,
  token,
  url,
}: {
  email: string | null;
  token: string;
  url: string;
}) {
  const location = new URL(url);
  const host = location.hostname;

  return `
    <table>
      <thead>
        <tr>
          <td>
            <h1>Welcome to POEMONGER</h1>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Finish signing up.</td>
          <td>
            <a
              href="${`https://${host}/activate?user=${email}&token=${token}`}"
            >
              Activate your account
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}
