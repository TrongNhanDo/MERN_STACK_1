import jtoken from 'jsonwebtoken'

const auth = (req, res, next) => {
    try {
        const token = req.header("Authorization")
        if (!token) return res.status(400).json({ msg: "Invalid Authentication" })

        jtoken.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(400).json({ msg: "Invalid Authentication" })

            req.user = user
            next()
        })
    } catch (error) {
        return res.status(500).json({ msg: error.message })
    }
}

const ACCESS_TOKEN_SECRET = '/6[G%DcSf]z"{z+M,az;'

export default auth