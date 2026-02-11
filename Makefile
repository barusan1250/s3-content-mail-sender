build-MailSenderFunction:
	# Copy source code and config files to artifacts directory
	cp handler.js $(ARTIFACTS_DIR)/
	cp package.json $(ARTIFACTS_DIR)/
	cp -r lib $(ARTIFACTS_DIR)/
	cp -r utils $(ARTIFACTS_DIR)/
	# Install only production dependencies
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
