const Gig = require("../models/Gig");

// ==============================
// CREATE GIG
// ==============================
exports.createGig = async (req, res) => {
    try {
        const { title, description, category, price, deliveryTime, features, images } = req.body;

        if (!title || !description || !category || !price || !deliveryTime) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const gig = await Gig.create({
            title,
            description,
            category,
            price,
            deliveryTime,
            features,
            images,
            freelancer: req.user.id,
        });

        res.status(201).json(gig);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// GET ALL GIGS (with Filters)
// ==============================
exports.getAllGigs = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;
        let query = { isActive: true };

        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (search) {
            query.title = { $regex: search, $options: "i" };
        }

        let sort = {};
        if (req.query.sort) {
            switch (req.query.sort) {
                case "price_asc":
                    sort = { price: 1 };
                    break;
                case "price_desc":
                    sort = { price: -1 };
                    break;
                case "newest":
                    sort = { createdAt: -1 };
                    break;
                case "oldest":
                    sort = { createdAt: 1 };
                    break;
                case "best_selling":
                    sort = { sales: -1 }; // Assuming 'sales' field exists, otherwise use rating
                    break;
                default:
                    sort = { createdAt: -1 };
            }
        } else {
            sort = { createdAt: -1 };
        }

        const gigs = await Gig.find(query).sort(sort).populate("freelancer", "name email");
        res.json(gigs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// GET GIG BY ID
// ==============================
exports.getGigById = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id).populate("freelancer", "name email portfolio");
        if (!gig) return res.status(404).json({ message: "Gig not found" });
        res.json(gig);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// UPDATE GIG
// ==============================
exports.updateGig = async (req, res) => {
    try {
        let gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ message: "Gig not found" });

        // Ensure user owns the gig
        if (gig.freelancer.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        gig = await Gig.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(gig);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// DELETE GIG
// ==============================
exports.deleteGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) return res.status(404).json({ message: "Gig not found" });

        if (gig.freelancer.toString() !== req.user.id) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await gig.deleteOne();
        res.json({ message: "Gig removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ==============================
// GET MY GIGS (Freelancer)
// ==============================
exports.getMyGigs = async (req, res) => {
    try {
        const gigs = await Gig.find({ freelancer: req.user.id });
        res.json(gigs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
