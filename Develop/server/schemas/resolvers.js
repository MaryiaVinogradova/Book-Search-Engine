const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { sign } = require('jsonwebtoken');


const resolvers = {
    Query: {
        me: async (parent, {_id}) => {
            const params = _id ? { _id } : {};
            return User.find(params);
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({username, email, password });

            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            const badCred = 'Improper credentials, please try again';

            if (!user) {
                throw new AuthenticationError(badCred);
            }

            const correctPW = await user.isCorrectPassword(password);

            if (!correctPW) {
                throw new AuthenticationError(badCred)
            }

            const token = signToken(user);

            return { token, user}
        },
        saveBook: async (parent, { user, authors, description, bookId, image, link, title }) => { const updatedUser = await User.findOneAndUpdate(
            {_id: user._id },
            { $addToSet: {savedBooks: {
                authors: authors,
                description: description,
                bookId: bookId,
                image: image,
                link: link,
                title: title
            }}},
            {new: true, runValidators: true }
            );
        },
        removeBook: async (parent, { user, bookId }) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: user.id },
                { $pull: { savedBooks: { bookId: bookId }}},
                { new: true }
            );
        }
    }
}