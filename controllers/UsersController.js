import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const userCollection = dbClient.db.collection('users');

      // Check if the email already exists
      const userExists = await userCollection.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Insert the new user
      const result = await userCollection.insertOne({
        email,
        password: hashedPassword,
      });

      // Return the new user with status code 201
      return res.status(201).json({
        id: result.insertedId,
        email,
      });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;

