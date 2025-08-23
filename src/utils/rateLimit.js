import rateLimit from "express-rate-limit";


export const limitter=rateLimit({
    windowMs:60*1000*5,
    limit:5,
    skipSuccessfulRequests:true,
    message:'too many requests, try after 5 minute'
})
export const limitterOTP=rateLimit({
    windowMs:60*1000*2,
    limit:5,
    skipSuccessfulRequests:true,
    message:'too many requests, Do resend OTP'
})