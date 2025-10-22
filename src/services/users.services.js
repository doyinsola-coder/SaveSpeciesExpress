import User from '../models/user.js';

export const createNewUser = async (name, email, password, phoneNumber, address,) => {
    const newUser = new User ({
        name: name,
        email: email,
        password: password,
        phoneNumber: phoneNumber,
        address: address
    })
    await newUser.save();
    return newUser 
};

export const getAll = async () => {
    const newUser = await User.find()
    return newUser
};

export const updateUser = async (id, name, emailAddress) => {
  return await User.findByIdAndUpdate(
    id,
    { name, email: emailAddress },
    { new: true }
  );
};

