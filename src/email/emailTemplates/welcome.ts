export const welcomeTemplate = (userDetails, password) =>
  `
    <!DOCTYPE html>
    <html>
        <h3>Welcome ${userDetails.name}</h3>
        <br/>
        <p>Please login using this email and password</p>
        <br />
        <p>Your Email: ${userDetails.email}</p>
        <br />
        <p>Your password: ${password}</p>
    </html>
    `;
