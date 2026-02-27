export const asyncHandler = async (fun) => {
  return async (next, req, res) => {
    try {
      await fun(next, req, res);
    } catch (error) {
      res.status(error.code).json({
        success: false,
        message: error.message,
      });
    }
  };
};
