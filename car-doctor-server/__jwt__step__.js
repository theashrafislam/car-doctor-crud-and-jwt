/**
 * Install Jsonwebtoken
 * jwt.sign (playload,secret, {expiresIn: })
 * token client
 */

/**
 * How to store token in the client side
 * 1. Memory --> ok type
 * 2. local storate --> ok type (XSS)
 * 3. cookies: http only
 */

/**
 * 1. set cookies with http only. for development secure: false,
 * 2. cors
 * app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}))

 * 3. client side axios setting
 * 
 */

/**
 * 1. to send cokkies from the client make sure you added withCredentials true for the api call using axios
 * 2. use cookie parser as middleware
 */