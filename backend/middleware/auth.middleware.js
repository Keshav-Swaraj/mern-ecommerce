import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorised - No access token provided" });
        }
        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return res.status(401).json({ message: "Unauthorised - User not found" });
            }
            req.user = user;
            next();
        }catch (error) {
            if(error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorised - Access token expired" });
            }
            throw error;
        }
    } catch (error) {
        console.log("error in auth middleware", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const adminRoute = (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next();
    }else{
        return res.status(401).json({ message: "Unauthorised - User not an admin" });
    }
}