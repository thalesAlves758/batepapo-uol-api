export default {
  post: async (req, res) => {
    const user = req.get('user');
    res.send(user);
  },
};
