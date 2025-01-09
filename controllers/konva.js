exports.getKonvaPage = async function (req, res) {
    try {
        res.render("pages/konva");
    } catch (error) {
        return res.status(400).json({ status: 400, message: error.message });
    }
};