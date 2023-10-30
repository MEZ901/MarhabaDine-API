const AuthControllerInterface = require("../../../application/interfaces/controllers/auth/AuthControllerInterface");

class AuthControllerImpl extends AuthControllerInterface {
  constructor(options) {
    super();
    this.usecases = options.usecases;
    this.schemas = options.schemas;
    this.authServices = options.authServices;
    this.emailServices = options.emailServices;
    this.userRepository = options.userRepository;
    this.userTokenRepository = options.userTokenRepository;
  }

  register = async (req, res) => {
    const { status, ...rest } = await this.usecases.register({
      userData: { ...req.body },
      registerSchema: this.schemas.registerSchema,
      authServices: this.authServices,
      emailServices: this.emailServices,
      userRepository: this.userRepository,
    });

    res.status(status).json({ ...rest });
  };

  login = async (req, res) => {
    const { status, jwt, ...rest } = await this.usecases.login({
      userData: { ...req.body },
      loginSchema: this.schemas.loginSchema,
      authServices: this.authServices,
      userRepository: this.userRepository,
      userTokenRepository: this.userTokenRepository,
    });

    if (jwt) {
      res.cookie("access_token", jwt.accessToken, { httpOnly: true });
      res.cookie("refresh_token", jwt.refreshToken, { httpOnly: true });
    }

    res.status(status).json({ ...rest });
  };

  logout = async (req, res) => {
    const { refreshToken } = req.body;
    const { status, ...rest } = await this.usecases.logout({
      refreshToken: refreshToken,
      refreshTokenSchema: this.schemas.refreshTokenSchema,
      authServices: this.authServices,
      userTokenRepository: this.userTokenRepository,
    });
    res.status(status).json({ ...rest });
  };

  refreshToken = async (req, res) => {
    const { refresh_token } = req.cookies;
    const { status, accessToken, ...rest } = await this.usecases.refreshToken({
      refreshToken: refresh_token,
      refreshTokenSchema: this.schemas.refreshTokenSchema,
      authServices: this.authServices,
      userRepository: this.userRepository,
      userTokenRepository: this.userTokenRepository,
    });

    if (accessToken) {
      res.cookie("access_token", accessToken, { httpOnly: true });
    }

    res.status(status).json({ ...rest });
  };

  verifyEmail = async (req, res) => {
    const { token } = req.query;
    const { status, ...rest } = await this.usecases.verifyEmail({
      token: token,
      authServices: this.authServices,
      userRepository: this.userRepository,
    });

    res.status(status).json({ ...rest });
  };
}

module.exports = AuthControllerImpl;
