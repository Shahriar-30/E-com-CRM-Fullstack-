import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    console.log(error);

    throw new apiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new apiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new apiError(400, "User already exists");
  }

  const user = await User.create({ name, email, password });

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while creating user");
  }

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    createdUser._id
  );

  let option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new apiRes(
        201,
        { createdUser, refreshToken, accessToken },
        "User registered successfully"
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new apiError(400, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(400, "Invalid credentials");
  }

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiRes(
        200,
        { user: loggedInUser, refreshToken, accessToken },
        "User logged in successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  let option = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new apiRes(200, {}, "User logout successfully"));
});
