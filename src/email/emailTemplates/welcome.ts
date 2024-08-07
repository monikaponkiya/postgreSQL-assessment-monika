export const welcomeTemplate = (userDetails, password) =>
  `
    <!DOCTYPE html>
    <html>
        <h3>Welcome ${userDetails.name}</h3>
        <br />
        <p>Your Email: ${userDetails.email}</p>
        <br />
        <p>Please login using this password: ${password}</p>
    </html>
    `;
