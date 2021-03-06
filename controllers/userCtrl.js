import Users from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jtoken from 'jsonwebtoken'

const userCtrl = {
    register: async(req, res) => {
        try {
            const { name, email, password } = req.body
            const user = await Users.findOne({ email })
            if (user) {
                return res.status(400).json({ msg: "The email already exists" })
            }
            if (password.length < 6) {
                return res.status(400).json({ msg: "Password is at least 6 characters long." })
            }
            // password encryption
            const passwordHash = await bcrypt.hash(password, 10)
            const newUser = new Users({
                name,
                email,
                password: passwordHash
            })

            //save data mongodb
            await newUser.save()

            //create jsonwebtoken to authentication
            const accesstoken = createAccessToken({ id: newUser._id })
            const refreshtoken = createRefreshToken({ id: newUser._id })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token'
            })

            //return result when register sucess
            res.json({ msg: "Register success!" })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    login: async(req, res) => {
        try {
            const { email, password } = req.body

            const user = await Users.findOne({ email })
            if (!user) return res.status(400).json({ msg: "User does not exists!" })

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) return res.status(400).json({ msg: "Incorrect password!" })

            // if login sucess, create access token and refresh token
            const accesstoken = createAccessToken({ id: user._id })
            const refreshtoken = createRefreshToken({ id: user._id })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token'
            })

            res.json({ accesstoken })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    logout: async(req, res) => {
        try {
            res.clearCookie('refreshtoken', { path: '/user/refresh_token' })
            return res.json({ msg: "Logged out!" })
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    },
    refreshToken: async(req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken
            if (!rf_token) return res.status(400).json({ msg: "Please login or register account!" })

            jtoken.verify(rf_token, REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(400).json({ msg: "Please login or register account!" })
                const accesstoken = createAccessToken({ id: user.id })
                res.json({ user, accesstoken })
            })
        } catch (error) {
            return res.status(400).json({ msg: error.message })
        }
    },
    getUser: async(req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password')
            if (!user) return res.status(400).json({ msg: "USer does not exists!" })

            res.json(user)
        } catch (error) {
            return res.status(500).json({ msg: error.message })
        }
    }
}

const ACCESS_TOKEN_SECRET = '/6[G%DcSf]z"{z+M,az;'
const REFRESH_TOKEN_SECRET = '46Uq$wu[:tsBN:;<LFp:u@{s3(%[@?'

const createAccessToken = (user) => {
    return jtoken.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
}
const createRefreshToken = (user) => {
    return jtoken.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

export default userCtrl