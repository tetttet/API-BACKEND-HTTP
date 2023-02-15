import { connect } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    const selectQuery = "SELECT * FROM users WHERE username = ?";
    connect.query(selectQuery, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(409).json("USER ALREADY EXISTS");
    });
    const saltSync = bcrypt.genSaltSync(10);
    const hashedPasswd = bcrypt.hashSync(req.body.password, saltSync);
    const insertQuery = "INSERT INTO users (`username`, `password`, `email`, `profilePic`) VALUE (?)";

    const values = [req.body.username, hashedPasswd, req.body.email, req.body.profilePic];
    connect.query(insertQuery, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("USER HAS BEEN CREATED");
    });

}


export const login = (req, res) => {
    const selectQuery = "SELECT * FROM users WHERE username = ?";
    connect.query(selectQuery, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(409).json("USER NOT FOUND");

        const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);
        if (!checkPassword) return res.status(400).json("WRONG PASSWORD OR USERNAME");

        const token = jwt.sign({ id: data[0].id }, "secretkey");
        const { password, ...others } = data[0];
        res.cookie("accessToken", token, {
            httpOnly: true,
        }).status(200).json(others);
    });
}

export const logout = (req, res) => {
    res.clearCookie("accessToken", {
        secure: true,
        sameSite: "none"
    }).status(200).json("USER HAS BEEN LOGOUT");
}