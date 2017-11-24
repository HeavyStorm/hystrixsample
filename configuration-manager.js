module.exports = class ConfigurationManager {
	getConfiguration() {
		// since the configuration is environment base, we can get it right away.
		let config = {
			mode: this._safeGetEnvironmentVariable("SERVICE_MODE", "string", "a", ["a", "b"]),
			services: {
				a: {
					procotocol : this._safeGetEnvironmentVariable("SERVICE_A_PROTOCOL", "string", "http", ["http", "https"]),
					hostname: this._safeGetEnvironmentVariable("SERVICE_A_HOSTNAME", "string", "servicea"),
					port: this._safeGetEnvironmentVariable("SERVICE_A_PORT", "number", 8080),
					name: "a"
				},
				b: {
					procotocol : this._safeGetEnvironmentVariable("SERVICE_B_PROTOCOL", "string", "http", ["http", "https"]),
					hostname: this._safeGetEnvironmentVariable("SERVICE_B_HOSTNAME", "string", "serviceb"),
					port: this._safeGetEnvironmentVariable("SERVICE_B_PORT", "number", 8080),
					name: "b"
				},
			}
		};

		switch (config.mode) {
			case "a": return { mode: config.mode, this: config.services.a, other: config.services.b };
			case "b": return { mode: config.mode, this: config.services.b, other: config.services.a };
			default: throw new Error("Config mode out-of-range");
		}
	}

	/**
	 * Get the env var, and throw if it's invalid.
	 * @param {string} envvar The name of the environment variable to get.
	 * @param {string} expectedType The type of the environment variable to get.
	 * @param {any[]} expectedValues The possible values for the envvar.
	 * @param {*} defaultValue The default value if the variable is not set. Null means it's required.
	 */
	_safeGetEnvironmentVariable(envvar, expectedType, defaultValue, expectedValues) {
		let value = process.env[envvar];
		if (value == null && defaultValue == null) throw new Error(`Enviroment variable "${envvar}" must be set.`);
		if (value == null) return defaultValue;
		if (typeof value !== expectedType) throw new Error(`Environment variable "${envvar}" should be of type "${expectedType}".`);
		if (expectedValues != null && expectedValues.indexOf(value) < 0) {
			throw new Error(`Environment variable "${envvar} should be one of ${expectedValues.join(",")}.`);
		}
	}
}
