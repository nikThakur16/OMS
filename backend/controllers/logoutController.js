
export const logout= (req, res) => {  
      
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    
      return res.status(200).json({ message: 'Logged out successfully' });
}