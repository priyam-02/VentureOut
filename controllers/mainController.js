exports.home = (req, res) => {
    res.render("./main/index");
};

exports.contact = (req, res) => {
    res.render("./main/contact");
};

exports.about = (req, res) => {
    res.render("./main/about");
};
