# Makefile for building the SAM application using Yarn

build-signUpFunction:
	# Enable Corepack to make the `yarn` command available in the container.
	corepack enable

	# 1. Install ALL dependencies (including devDependencies) so that
	#    build tools like esbuild and typescript are available.
	#    The --immutable flag ensures we use the exact versions from yarn.lock.
	yarn install --immutable

	# 2. Run the build script from package.json to compile TypeScript.
	yarn build

	# 3. Prune devDependencies. Re-running install with --production
	#    will remove any packages not listed in "dependencies".
	#    This ensures the final artifact is small and optimized for Lambda.
	yarn install --immutable --production

	# 4. Copy the final artifacts (compiled code and production node_modules)
	#    to the directory SAM CLI expects for packaging.
	cp -r dist/ $(ARTIFACTS_DIR)
	cp -r node_modules/ $(ARTIFACTS_DIR)
	cp package.json $(ARTIFACTS_DIR)

# Since all your other functions use the exact same source and build process,
# we can make them aliases for the main build target.
build-signInFunction: build-signUpFunction
build-getUserProfileFunction: build-signUpFunction
build-getAllItemsFunction: build-signUpFunction
build-getByIdFunction: build-signUpFunction
build-putItemFunction: build-signUpFunction