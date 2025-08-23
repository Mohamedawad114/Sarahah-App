import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 20,
    },
    phone: {
      type: String,
       required: function(){
        return this.provider ==='system'
      },
    },
    email: {
      type: String,
      required: true,
      match: [/^[a-zA-Z0-9-.+#]+@gmail.com$/, "invalid Email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minLength: [6, "password length should be greater 6"],
      required: function(){
        return this.provider==='system'
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
      required: function(){
        return this.provider==='system'
      },
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    role: {
      type: String,
      enum: ["user", "Admin"],
      default: "user",
    },
    provider:{
      type:String,
      enum:["system","google"],
      default:"system"
    },
    subId:{
      type:Number
    },
    isconfirmed: {
      type: Boolean,
      default: false,
    },
    image:{
      url:{type:String,default:""},
      public_id:{type:String,default:""}
    }
  },
  {
    timestamps: true,
    toJSON:{
        virtuals:true
    },toObject:{
      virtuals:true
    }
  }
);
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.virtual("Message",{
  ref:"message",
  localField:"_id",
  foreignField:"reciverId"
}
);

const user = mongoose.model("User", userSchema);
export default user;
