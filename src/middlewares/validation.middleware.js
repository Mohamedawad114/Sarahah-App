const keys = ["body", "params", "headers", "query"];
export const validate = (Schema) => {
  return (req, res, next) => {
    let validateError = [];
    for (const key of keys) {
      if (Schema[key]) {
        const { error } = Schema[key].validate(req[key], { abortEarly: false });
        if (error) {
          validateError.push(...error.details);
        }
      }
    }
    if (validateError.length) {
      return res.status(400).json({
        message: "Validation error",
        errors: validateError.map((err) => err.message),
      });
    }
    next();
  };
};
