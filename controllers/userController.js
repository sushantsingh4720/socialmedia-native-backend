import fs from "fs";
const Signup = (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    fs.rmSync("./tmp", { recursive: true });
    res.status(200).json({ success: true, message: "done" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
export { Signup };
