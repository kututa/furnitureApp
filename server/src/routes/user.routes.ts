import express from "express";
import {
    approveUser,
    deleteUserById,
    getAllUsers,
    toggleSuspendUser,
} from "../controllers/user.controller";

const router = express.Router();

// TODO: Add admin authentication middleware

router.get("/users", getAllUsers);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/suspend", toggleSuspendUser);
router.delete("/users/:id", deleteUserById);

export default router;
