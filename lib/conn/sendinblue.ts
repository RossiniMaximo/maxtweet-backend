import SibApiV3Sdk from "sib-api-v3-sdk";
SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey =
  process.env.SENDINBLUE_API_KEY;

export function sendEmail(body) {
  return new SibApiV3Sdk.TransactionalEmailsApi()
    .sendTransacEmail({
      sender: { email: process.env.SECREY_EMAIL, name: "Maximo" },
      subject: "Authorization code",
      htmlContent:
        "<!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>",
      params: {
        greeting: "This is the default greeting",
        headline: "This is the default headline",
      },
      messageVersions: [
        {
          to: [
            {
              email: body.email,
              name: body.fullname,
            },
          ],
          htmlContent: ` <!DOCTYPE html><html><body><h1>¡Authorization!</h1><p>Your code is : ${body.code}</p></body></html>`,
          subject: "¡Thank you for signing in!",
        },
      ],
    })
    .then(
      function (data) {
        console.log(data);
      },
      function (error) {
        console.error(error);
      }
    );
}
