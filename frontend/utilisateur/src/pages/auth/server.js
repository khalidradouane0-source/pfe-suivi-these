import express from "express"
import nodemailer from "nodemailer"

const app = express()
app.use(express.json())

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "YOUR_GMAIL@gmail.com",
        pass: "APP_PASSWORD"
      }
    })
const dashboardRouter = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRouter);
    const resetLink = "http://localhost:5173/reset-password"

    await transporter.sendMail({
      from: "YOUR_GMAIL@gmail.com",
      to: email,
      subject: "Reset Password",
      html: `
        <h2>Password Reset</h2>
        <p>Klik 3la had lien:</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    })

    res.json({ message: "Email tsift ✔️" })

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Erreur f email" })
  }
})

app.listen(5000, () => console.log("Server khdam f 5000"))
