
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

// Middleware to validate ObjectId
export function validateObjectId(req, res, next) {
  const id = req.params.id;
  if(!id) next();
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid ObjectId' });
  }
  next();
}