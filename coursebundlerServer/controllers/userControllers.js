import { catchAsyncError } from "../middlewares/catchAsynError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js"
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import { Course } from "../models/Course.js"
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js";
import twilio from "twilio";


export const register = catchAsyncError(async (req, res, next) => {

    const { name, email, number, password } = req.body;

    const file = req.file;


    if (!name || !email || !number || !password || !file)
        return next(new ErrorHandler("Please Enter All Field", 400));

    let user = await User.findOne({ email });

    if (user)
        return next(new ErrorHandler("User Already Exist", 409));


    const fileUri = getDataUri(file);

    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    user = await User.create({
        name,
        email,
        number,
        password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        },
    });

    sendToken(res, user, "Registered Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body;


    if (!email || !password)
        return next(new ErrorHandler("Please Enter All Field", 400));

    const user = await User.findOne({ email }).select("+password");

    if (!user)
        return next(new ErrorHandler("Incorrect Email or Password", 401));

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
        return next(new ErrorHandler("Incorrect Email or Password", 401))

    sendToken(res, user, `Welcome back ,${user.name}`, 200);
});

export const mobilelogin = catchAsyncError(async (req, res, next) => {


    const { number } = req.body;

    if (!number)
        return next(new ErrorHandler("Please Enter All Field", 400));

    const user = await User.findOne({ number });

    if (!user)
        return next(new ErrorHandler("User not found", 400))


    // TWILIO OTP STARTS

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
        .verifications.create({
            to: `+91${number}`,
            channel: "sms",

        })

        .then(response => {

            res.status(200).json({
                success: true,
                message: "OTP send to Your Registered Mobile Number",
                number,

            })
        }

        ).catch(e => {
            res.status(200).json({
                success: false,
                message: e.message
            })

        })

    // TWILIO OTP END


});

export const OtpVerification = catchAsyncError(async (req, res, next) => {

    const { otp, number } = req.body;

    if (!otp)
        return next(new ErrorHandler("Please Enter All Field", 400));

    const user = await User.findOne({ number });

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
        .verificationChecks.create({
            to: `+91${number}`,
            code: otp,
        })

        .then(response => {

            if (response.valid == false) {
                res.status(400).json({
                    success: false,
                    message: 'OTP is Invalid'
                })
            };
            sendToken(res, user, `Welcome back ,${user.name}`, 200);
        })


        .catch(err => {
            res.status(200).json({
                success: false,
                message: 'Error '
            })
        })


});


export const logout = catchAsyncError(async (req, res, next) => {
    res
        .status(200)
        .cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
        .json({
            success: true,
            message: "Logged Out Successfully",
        });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        success: true,
        user,
    });

});

export const changePassword = catchAsyncError(async (req, res, next) => {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
        return next(new ErrorHandler("please enter all field", 400));

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch)
        return next(new ErrorHandler("Incorrect Old Password", 400));

    user.password = newPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Change Successfully",
    });

});

export const updateProfile = catchAsyncError(async (req, res, next) => {

    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated Successfully",
    });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {

    const file = req.file;

    const user = await User.findById(req.user._id);


    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
    };

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Picture Updated Successfully",
    });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {

    const { email } = req.body;

    const user = await User.findOne({ email });


    if (!user) return next(new ErrorHandler("User not found", 400));

    const resetToken = await user.getResetToken();

    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const mesage = `Click on the link to reset your password. ${url}. 
    If you have not request then please ingnore.`

    //send token via 

    await sendEmail(user.email, "NextGen Learning Reset Password", mesage)

    res.status(200).json({
        success: true,
        messgage: `Reset Token has been sent to ${user.email}`,
    });
});


export const resetPassword = catchAsyncError(async (req, res, next) => {

    const { token } = req.params;


    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {
            $gt: Date.now(),
        },
    });

    if (!user)
        return next(new ErrorHandler("Token is invalid or has been expired"));

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;


    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Changed Successfully",


    });
});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body.id)

    if (!course)
        return next(new ErrorHandler("Invalid Course Id", 404));

    const itemExist = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString())
            return true;
    });

    if (itemExist)
        return next(new ErrorHandler("Item Already Exist", 409));



    user.playlist.push({
        course: course._id,
        poster: course.poster.url,
    });

    await user.save();

    res.status(200).json({
        success: true,
        message: "Added to playlist",
    });

});


export const removeFromPlaylsit = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.query.id);

    if (!course)
        return next(new ErrorHandler("Invalid Course Id", 404));

    const newPlaylist = user.playlist.filter((item) => {
        if (item.course.toString() !== course._id.toString())
            return item
    });
    user.playlist = newPlaylist;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Removed From Playlist",
    });
});

//Admin Controllers

export const getAllUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find({});

    res.status(200).json({
        success: true,
        users,
    })
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user)
        return next(new ErrorHandler("User Not Found", 404));

    if (user.role === "user")
        user.role = "admin";
    else user.role = "user";

    await user.save();

    res.status(200).json({
        success: true,
        mesage: "Role Updated",
    });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("User Not Found", 404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //Cancel subscription

    await user.deleteOne();

    res.status(200).json({
        success: true,
        mesage: "User Deleted Successfully",
    })
});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    //cancel subscription

    await user.deleteOne();

    res
        .status(200)
        .cookie("token", null, {
            expires: new Date(Date.now()),

        })
        .json({
            success: true,
            message: "User Deleted Successfully",
        });

});
User.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
    const subscription = await User.find({ "subscription.status": "active" });

    stats[0].users = await User.countDocuments();
    stats[0].subscription = subscription.length;
    stats[0].createdAt = new Date(Date.now());

    await stats[0].save();
});

