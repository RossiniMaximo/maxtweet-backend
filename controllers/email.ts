import { sendEmail } from "../lib/conn/sendinblue";

export function mailSender(body) {
  const result = sendEmail(body);
  return result;
}
