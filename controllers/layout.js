exports.getLayout = async function (req, res) {
    try {
        res.render("pages/layout");
    } catch (error) {
        return res.status(400).json({ status: 400, message: error.message });
    }
};