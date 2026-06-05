const authService = require("../services/authService");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });

    const data = await authService.login(username, password);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const me = (req, res) => {
  res.status(200).json({ success: true, data: req.user });
};

module.exports = { login, me };
