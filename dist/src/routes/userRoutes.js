"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.status(200).json({ message: "List of users" });
});
router.get("/:id", (req, res) => {
    res.status(200).json({ message: `Details of user with id ${req.params.id}` });
});
router.post("/", (req, res) => {
    res.status(201).json({ message: "User created successfully" });
});
router.put("/:id", (req, res) => {
    res.status(200).json({ message: `User with id ${req.params.id} updated successfully` });
});
router.delete("/:id", (req, res) => {
    res.status(200).json({ message: `User with id ${req.params.id} deleted successfully` });
});
exports.default = router;
