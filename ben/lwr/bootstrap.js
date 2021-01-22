/*
 * Copyright 2020 salesforce.com, inc.
 * All Rights Reserved
 * Company Confidential
 *
 * TO MINIFY: Use Google Closure Compiler:
 *		google-closure-compiler --js=bootstrap.js --js_output_file=bootstrap.min.js --rewrite_polyfills=false
 *
 *		Install google-closure-compiler by running:
 *			npm install -g google-closure-compiler
 */
(() => {
	const CONVERSATION_BUTTON_WRAPPER_CLASS = "embeddedMessagingConversationButtonWrapper";
	const CONVERSATION_BUTTON_POSITION_CLASS = "embeddedMessagingButtonPosition";
	const CONVERSATION_BUTTON_CLASS = "embeddedMessagingConversationButton";
	const GSLB_BASE_URL = "https://service.force.com";
	const DEFAULT_HEIGHT = "554";
	const DEFAULT_HEIGHT_MOBILE = "70vh";
	const DEFAULT_WIDTH = "344";
	const DEFAULT_WIDTH_MOBILE = "85vw";
	const DEFAULT_ICONS = {};
	// TODO: confirm these as they will be AIPs
	const APP_LOADED_EVENT_NAME = "ESW_APP_LOADED";
	const APP_MINIMIZE_EVENT_NAME = "ESW_APP_MINIMIZE";
	const APP_MAXIMIZE_EVENT_NAME = "ESW_APP_MAXIMIZE";
	const SALESFORCE_DOMAINS = [
		// Used by dev, blitz, and prod instances
		".salesforce.com",

		// Used by VPODs
		".force.com",

		// Used by autobuild VMs
		".sfdc.net"
	];
	const IFRAME_ROUNDED_CLASS = "embeddedMessagingFrameRounded";
	const IFRAME_NO_SHADOW_CLASS = "embeddedMessagingFrameNoShadow";

	/**
	 * EmbeddedServiceBootstrap global object which creates and renders a <newAuraApplicationName>.
	 *
	 * @class
	 * @property {object} settings - A list of settings that can be set here or within init.
	 */
	function EmbeddedServiceBootstrap() {
		this.settings = { devMode: false };

		// Default chat icon data.
		Object.defineProperties(DEFAULT_ICONS, {
			CHAT: {
				value: "M50 0c27.614 0 50 20.52 50 45.833S77.614 91.667 50 91.667c-8.458 0-16.425-1.925-23.409-5.323-13.33 6.973-21.083 9.839-23.258 8.595-2.064-1.18.114-8.436 6.534-21.767C3.667 65.54 0 56.08 0 45.833 0 20.52 22.386 0 50 0zm4.583 61.667H22.917a2.917 2.917 0 000 5.833h31.666a2.917 2.917 0 000-5.833zm12.5-15.834H22.917a2.917 2.917 0 000 5.834h44.166a2.917 2.917 0 000-5.834zM79.583 30H22.917a2.917 2.917 0 000 5.833h56.666a2.917 2.917 0 000-5.833z"
			}
		});
	}

	/**
	 * Determine if a string is a valid Salesforce entity ID.
	 *
	 * @param {string} entityId - The value that should be checked.
	 * @returns {boolean} Is this a valid entity Id?
	 */
	EmbeddedServiceBootstrap.prototype.isValidEntityId = function isValidEntityId(entityId) {
		return typeof entityId === "string" && (entityId.length === 18 || entityId.length === 15);
	};

	/**
	 * Extract the entity key prefix from a valid entity ID.
	 *
	 * @param {string} entityId = The string from which to extract the entity ID.
	 * @returns {string} The key prefix, if this ID is valid.
	 */
	EmbeddedServiceBootstrap.prototype.getKeyPrefix = function getKeyPrefix(entityId) {
		if(embeddedservice_bootstrap.isValidEntityId(entityId)) return entityId.substr(0, 3);

		return undefined;
	};

	/**
	 * Determines if a string is a valid Salesforce organization ID.
	 *
	 * @param {string} entityId - An entity ID.
	 * @returns {boolean} Is the string an organization ID?
	 */
	EmbeddedServiceBootstrap.prototype.isOrganizationId = function isOrganizationId(entityId) {
		return embeddedservice_bootstrap.getKeyPrefix(entityId) === "00D";
	};

	/**
	 * Merge a key-value mapping into the setting object, such that the provided
	 * map takes priority.
	 *
	 * @param {object} additionalSettings - A key-value mapping.
	 */
	function mergeSettings(additionalSettings) {
		if(additionalSettings && typeof additionalSettings === "object") {
			Object.keys(additionalSettings).forEach((key) => {
				if(embeddedservice_bootstrap.settings[key] === undefined) {
					embeddedservice_bootstrap.settings[key] = additionalSettings[key];
				}
			});
		}
	}

	/**
	 * Checks if the baseObject's functionName method is still native code or if it has been modified.
	 *
	 * @param {Object} baseObject - Base object to check for modification of native code.
	 * @param {string} functionName - Function name to check.
	 * @return {boolean} Is the baseObject's functionName method still native code?
	 */
	function isNativeFunction(baseObject, functionName) {
		return Function.prototype.toString.call(baseObject[functionName]).match(/\[native code\]/);
	}

	/**
	 * Output to the console using a specified method.
	 *
	 * @param {string} method - The console method to use.
	 * @param {Array.<*>} args - Objects to be displayed comma-delimited.
	 * @param {boolean} alwaysOutput - Always log to console regardless of devMode setting.
	 */
	function outputToConsole(method, args, alwaysOutput) {
		if((alwaysOutput || embeddedservice_bootstrap.settings.devMode) && console && console[method]) { // eslint-disable-line no-console
			console[method]("[EmbeddedServiceBootstrap] " + (Array.isArray(args) ? args.join(", ") : args)); // eslint-disable-line no-console
		}
	}

	/**
	 * Log a message to the console.
	 *
	 * @param {...object} messages - Objects to be displayed comma-delimited.
	 */
	function log() {
		outputToConsole("log", [].slice.apply(arguments));
	}

	/**
	 * Log a warning.
	 *
	 * @param {string} message - The warning message to print.
	 * @param {boolean} alwaysOutput - Always log to console regardless of devMode setting.
	 */
	function warning(message, alwaysOutput) {
		if(message) {
			outputToConsole("warn", "Warning: " + message, alwaysOutput);
		} else {
			outputToConsole("warn", "EmbeddedServiceBootstrap sent an anonymous warning.", alwaysOutput);
		}
	}

	/**
	 * Log an error.
	 *
	 * @param {string} message - The error message to print.
	 * @param {boolean} alwaysOutput - Always log to console regardless of devMode setting.
	 */
	function error(message, alwaysOutput) {
		if(message) {
			outputToConsole("error", message, alwaysOutput);
		} else {
			outputToConsole("error", "EmbeddedServiceBootstrap responded with an unspecified error.", alwaysOutput);
		}
	}

	function isSiteContext() {
		return window.$A && typeof window.$A.get === "function" && window.$A.get("$Site");
	}

	/**
	 * Determines if a message origin url has a Salesforce domain. Used for filtering non-Salesforce messages.
	 *
	 * @param {string} messageOriginUrl - String containing the origin url. This should end with the domain (strip off the port before passing to this function).
	 * @return {boolean} Did message come from page hosted on Salesforce domain?
	 */
	function isMessageFromSalesforceDomain(messageOriginUrl) {
		var endsWith;
		var messageOrigin = messageOriginUrl.split(":")[1].replace("//", "");

		/**
		 * 1st check - if on Experience Cloud platform, and endpoint is same as hosting site,
		 *             message origin will be from same domain as document
		 */
		if(isSiteContext() && messageOrigin === document.domain) {
			return true;
		}

		/**
		 * "Polyfill" for String.prototype.endsWith since IE doesn't support it.
		 *
		 * @param {string} first - Does the first string...
		 * @param {string} second - ...end with the second string?
		 * @return {boolean} Does it?
		 */
		endsWith = function(first, second) {
			return first.indexOf(second, first.length - second.length) !== -1;
		};

		/**
		 * 2nd check - message origin is an actual salesforce domain
		 */
		return SALESFORCE_DOMAINS.some(function(salesforceDomain) {
			return endsWith(messageOrigin, salesforceDomain);
		});
	}

	/******************************************************
						Icon rendering
		This is copied from embeddedService:iconHelper.js.
	******************************************************/
	/**
	 * You can add icons by defining either their SVG path or an array of objects representing the SVG structure.
	 *
	 * Your icon should have a `viewBox` of `0 0 100 100`. If it doesn't, you can scale it using this tool:
	 * [https://jakearchibald.github.io/svgomg/](https://jakearchibald.github.io/svgomg/).
	 * See [https://salesforce.quip.com/1refAeGnpAeW](https://salesforce.quip.com/1refAeGnpAeW) for instructions.
	 *
	 * If you add an icon, make sure you update the icon repository so that we can make sure we don't lose any:
	 * [https://git.soma.salesforce.com/embedded-service-for-web/embedded-service-icons/tree/master/InAppMessaging](https://git.soma.salesforce.com/embedded-service-for-web/embedded-service-icons/tree/master/InAppMessaging)
	 *
	 * The parent repository has a `scale.svg` file which you can put your path into and upload to the scaling tool. Make sure you change
	 * the `transform: scale` amount to be the value of `startWidth/endWidth`.
	 */
	/**
	 * Create an SVG element of a given type, using attributes provided in a map.
	 * If an attribute "children" is provided, createSVGElement will be run using the objects in that array.
	 *
	 * @param {SVGElement} parent - The parent element for this SVG element.
	 * @param {String} elementType - The type of element to create.
	 * @param {Object} elementDefinition - Attributes to attach to the element.
	 */
	function createSVGElement(parent, elementType, elementDefinition) {
		const element = document.createElementNS("http://www.w3.org/2000/svg", elementType);

		Object.getOwnPropertyNames(elementDefinition).forEach((attribute) => {
			if(attribute === "children") {
				elementDefinition.children.forEach((childElementDefinition) => {
					createSVGElement(element, childElementDefinition.type, childElementDefinition);
				});
			} else {
				element.setAttribute(attribute, elementDefinition[attribute]);
			}
		});

		// TextNodes added to address accessibility bug in Safari 10.x (https://bugs.webkit.org/show_bug.cgi?id=162866)
		parent.appendChild(document.createTextNode("\n"));
		parent.appendChild(element);
		parent.appendChild(document.createTextNode("\n"));
	}

	/**
	 * Renders the SVG element using the icon data (i.e. path definition).
	 *
	 * @param {String} iconData - Reference to the icon data.
	 * @return {SVGElement} - The reference for this SVG element.
	 */
	function renderSVG(iconData) {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		if(iconData) {
			svg.setAttribute("focusable", "false");
			svg.setAttribute("aria-hidden", "true");
			svg.setAttribute("viewBox", "0 0 100 100");

			if(Array.isArray(iconData)) {
				iconData.forEach((pathDefinition) => {
					createSVGElement(svg, pathDefinition.type, pathDefinition);
				});
			} else {
				createSVGElement(svg, "path", { d: iconData });
			}

			return svg;
		} else {
			error("Invalid icon data.");
		}

		return undefined;
	}

	/**
	 * Check for modified document/window native JS methods and output a warning for each overriden method.
	 * These methods are used in EmbeddedServiceBootstrap and also in Aura.
	 */
	function checkForNativeFunctionOverrides() {
		let documentFunctionsToCheck = [
			"addEventListener",
			"createAttribute",
			"createComment",
			"createDocumentFragment",
			// SFDC overrides createElement so we'll skip this one.
			// "createElement",
			"createElementNS",
			"createTextNode",
			"createRange",
			"getElementById",
			"getElementsByTagName",
			"getElementsByClassName",
			"querySelector",
			"querySelectorAll",
			"removeEventListener"
		];
		let windowFunctionsToCheck = [
			"addEventListener",
			"clearTimeout",
			"dispatchEvent",
			"open",
			"removeEventListener",
			"requestAnimationFrame",
			"setInterval",
			"setTimeout"
		];
		let objectsToCheck = [{
			name: "document",
			object: document,
			functions: documentFunctionsToCheck
		}, {
			name: "window",
			object: window,
			functions: windowFunctionsToCheck
		}];

		// For each object type (doc/win), we want to check their expected native functions.
		objectsToCheck.forEach((objectToCheck) => {
			objectToCheck.functions.forEach((nativeFunction) => {
				if(nativeFunction in objectToCheck.object && !isNativeFunction(objectToCheck.object, nativeFunction)) {
					warning(
						"EmbeddedService Messaging Bootstrap may not function correctly with this native JS function modified: " + objectToCheck.name + "." + nativeFunction,
						true
					);
				}
			});
		});
	}

	/**
	 * Event handlers for resizing the iframe dynamically, based on size/state of the aura application.
	 */
	function addEventHandlers() {
		window.addEventListener("message", (e) => {
			if(e && e.data && e.origin) {
				if(e.origin === "null" ||
						(embeddedservice_bootstrap.settings.embeddedServiceConfig.siteUrl.indexOf(e.origin) === 0
						 && isMessageFromSalesforceDomain(e.origin))) {
					let frame = document.getElementById("embeddedMessagingFrame");
					
					// TODO: Confirm event name with product.
					if(e.data.method === APP_LOADED_EVENT_NAME) {
						let button = document.getElementById(CONVERSATION_BUTTON_CLASS);
						let iconContainer = document.getElementById("embeddedMessagingIconContainer");
						let chatIcon = document.getElementById("embeddedMessagingIconChat");
						let loadingSpinner = document.getElementById("embeddedMessagingLoadingSpinner");

						embeddedservice_bootstrap.maximizeIframe(frame);

						// Unhide iframe.
						frame.style.display = "inline-block";

						// Reset the Conversation button once the aura application is loaded in the iframe. Ifame/Chat window is rendered on top of FAB.
						iconContainer.removeChild(loadingSpinner);
						chatIcon.style.display = "block";
						button.disabled = false;
						button.classList.remove("embeddedMessagingConversationButtonLoading");
						button.classList.add("embeddedMessagingConversationButtonLoaded");
						button.classList.add("no-hover");
					} else if(e.data.method === APP_MINIMIZE_EVENT_NAME) {
						embeddedservice_bootstrap.minimizeIframe(frame, e.data.data);
					} else if(e.data.method === APP_MAXIMIZE_EVENT_NAME) {
						embeddedservice_bootstrap.maximizeIframe(frame);
					}
				} else {
					error("Unexpected message origin: " + e.origin);

					return;
				}
			}
		});
	}

	/**
	 * Validate all the necessary attributes on the settings object.
	 */
	function validateSettings() {
		if(typeof embeddedservice_bootstrap.settings.baseCoreURL !== "string") throw new Error("Base core URL value must be a string.");
		if(typeof embeddedservice_bootstrap.settings.scrtUrl !== "string") throw new Error("SCRT URL value must be a string.");
		if(!embeddedservice_bootstrap.settings.embeddedServiceConfig) throw new Error("Embedded Service Config not present");
		if(typeof embeddedservice_bootstrap.settings.embeddedServiceConfig.siteUrl !== "string") throw new Error("Site URL value must be a string.");

		if(!embeddedservice_bootstrap.isOrganizationId(embeddedservice_bootstrap.settings.orgId)) throw new Error("Invalid OrganizationId Parameter Value: " + embeddedservice_bootstrap.settings.orgId);
	}

	/**
	 * Load the bootstrap.css file for this static file.
	 */
	function loadCSS(urlToLoadFrom) {
		return new Promise((resolve, reject) => {
			let link = document.createElement("link");

			let baseURL = urlToLoadFrom ? urlToLoadFrom : GSLB_BASE_URL;

			link.href = baseURL + "/embeddedservice/asyncclient/bootstrap" + (embeddedservice_bootstrap.settings.devMode ? "" : ".min") + ".css";
			link.type = "text/css";
			link.rel = "stylesheet";

			link.onerror = reject;
			link.onload = resolve;

			document.getElementsByTagName("head")[0].appendChild(link);
		});
	}
	
	/**
	 * Load the config from SCRT 1.0 stack
	 */
	function loadConfigFromScrt() {
		return new Promise((resolve, reject) => {
			const callbackName = "eswJsonPConfigCallback";
			let scriptElem = document.createElement("script");

			function cleanUp() {
				window[callbackName] = undefined;
				document.body.removeChild(scriptElem);
				scriptElem = null;
			}

			scriptElem.type = "text/javascript";
			scriptElem.async = true;
			scriptElem.src = embeddedservice_bootstrap.settings.scrtUrl +
				"/rest/EmbeddedService/EmbeddedServiceConfig.jsonp?Settings.prefix=EmbeddedService" +
				"&org_id=" + embeddedservice_bootstrap.settings.orgId +
				"&EmbeddedServiceConfig.configName=" + embeddedservice_bootstrap.settings.eswConfigDevName +
				"&callback=" + callbackName + "&version=48";

			scriptElem.addEventListener("error", error => {
				cleanUp();
				reject(error);
			});

			window[callbackName] = (data) => {
				cleanUp();

				data.messages.forEach( (message) => {
					if(message.type === "EmbeddedServiceConfig") {
						mergeSettings(message.message);
						resolve();
					} else if(message.type === "SwitchServer") {
						log("Your org has been migrated on the Service Cloud Real Time servers.", true);
						embeddedservice_bootstrap.settings.scrtUrl = message.message.newUrl;
						reject();
					} else if(message.type === "EmbeddedServiceError" || message.type === "Error") {
						reject();
					}
				});
			};
			
			document.body.appendChild(scriptElem);
		});
	}

	/**
	 * Validate settings and begin the process of rendering DOM elements.
	 *
	 * @param {string} orgId - the entity ID for the organization.
	 * @param {string} eswConfigDevName - The developer name for the EmbeddedServiceConfig object.
	 * @param {string} scrtURL - the scrt (1.0) URL for settings.
	 * 			TODO: update config w/ new schema. For now using 1.0 EmbeddedServiceConfig schema.
	 * @param {string} inAppServerUrl
	 * @param {string} baseCoreURL - the base URL for the core (non-experience site) instance for the org.
	 * @param {object} snippetConfig - configuration on container page. Takes preference over server-side configuration.
	 */
	EmbeddedServiceBootstrap.prototype.init = function init(orgId, eswConfigDevName, scrtUrl, baseCoreURL, snippetConfig) {
		try {
			embeddedservice_bootstrap.settings.orgId = orgId;
			embeddedservice_bootstrap.settings.scrtUrl = scrtUrl;
			embeddedservice_bootstrap.settings.baseCoreURL = baseCoreURL;
			embeddedservice_bootstrap.settings.eswConfigDevName = eswConfigDevName;
			embeddedservice_bootstrap.settings.snippetConfig = snippetConfig;

			// TODO: Make a call to scrt-1.0, obtain settings and merge it with the settings object.
			mergeSettings(snippetConfig || {});

			checkForNativeFunctionOverrides();

			if(!document.body) throw new Error("Document body not loaded.");

			addEventHandlers();

			// Load css file for bootstrap.js.
			const cssPromise = loadCSS().then(
				Promise.resolve,
				() => {
					// Retry loading .css from baseCoreURL, if failed to load from GSLB_BASE_URL.
					return loadCSS(embeddedservice_bootstrap.settings.baseCoreURL);
				}
			).catch(
				() => {
					throw new Error("Error loading CSS.");
				}
			);

			// Load config from SCRT1 - retry 1 time if fail.
			const configPromise = loadConfigFromScrt().catch(
				() => {
					return loadConfigFromScrt().catch(
						() => {
							if(embeddedservice_bootstrap.settings.devMode) {
								warning("Unable to load config from SCRT - continuing in devMode");
							} else {
								throw new Error("Error loading config from SCRT");
							}
						}
					);
				}
			);

			// Show button when we've loaded everything.
			Promise.all([cssPromise, configPromise]).then( () => {
				validateSettings();
				embeddedservice_bootstrap.showConversationButton();
			});
		} catch(err) {
			error("Error: " + err);
		}
	};

	/**
	 * Set loading status for the button after clicking on it. This is to show the loading status of creating an iframe which would load an aura application.
	 */
	function setLoadingStatusForButton() {
		let button = document.getElementById(CONVERSATION_BUTTON_CLASS);
		let iconContainer = document.getElementById("embeddedMessagingIconContainer");
		let chatIcon = document.getElementById("embeddedMessagingIconChat");
		let loadingSpinner = document.createElement("div");
		let circle;
		let i = 1;

		if(button) {
			// Hide the default chat icon on the button.
			chatIcon.style.display = "none";

			// [Animations] Build loading spinner.
			loadingSpinner.setAttribute("class", "embeddedMessagingLoadingSpinner");
			loadingSpinner.setAttribute("id", "embeddedMessagingLoadingSpinner");
			for(; i < 13; i++) {
				circle = document.createElement("div");
				circle.setAttribute("class", "embeddedMessagingLoadingCircle" + i + " embeddedMessagingLoadingCircle");
				loadingSpinner.appendChild(circle);
			}

			loadingSpinner.classList.add("embeddedMessagingIconLoading");

			// Set loading state for the button.
			button.classList.add("embeddedMessagingConversationButtonLoading");
			// Load the animations for button.
			iconContainer.insertBefore(loadingSpinner, chatIcon);
			button.disabled = true;
		}
	}

	/**
	 * Check if we are on a Desktop (non mobile) based on information in the user agent.
	 * Browsers on tablets behave the same as mobile devices.
	 * @returns {boolean} - True if Desktop, false if Mobile client.
	 */
	function isDesktop() {
		return navigator.userAgent.indexOf("Mobi") === -1;
	}

	/**
	 * Apply styles to iframe depending on current browser client.
	 * @param {Object} frame - Reference to iframe DOM element.
	 */
	function applyDynamicStylesToIframe(frame) {
		let branding = embeddedservice_bootstrap.settings.embeddedServiceConfig.embeddedServiceBranding || {};

		// Assign different width/height for mobile clients. 64.0625em is the equivalent of @media t(mqLarge) in Aura.
		if (isDesktop() === false && window.matchMedia("(max-width: 64.0625em)").matches) {
			frame.style.height = DEFAULT_HEIGHT_MOBILE;
			frame.style.width = DEFAULT_WIDTH_MOBILE;
		} else {
			// Desktop clients.
			frame.style.height = (branding.height || DEFAULT_HEIGHT) + "px";
			frame.style.width = (branding.width || DEFAULT_WIDTH) + "px";
		}
	}

	/**
	 * On click of Conversation button,
	 * (i) Create an iframe and set source as the aura application, loaded through the experienceSiteEndpointURL.
	 *		Wrap iframe in 2 divs to allow scrolling/responsiveness in iframe without viewport on page header
	 * (ii) Append iframe to the DOM of the container page.
	 * (iii) Hide the Conversation button once iframe is loaded.
	 */
	function createIframe() {
		try {
			let iFrame = document.createElement("iframe");
			let iFrameConfig = {};
			
			// TODO: build the configurations which will be sent to the iframe.
			iFrameConfig.parentOrigin = window.location.href;

			// TODO: FOR TEMPORARY INTERNAL DEVELOPMENT.
			iFrameConfig.orgId = embeddedservice_bootstrap.settings.orgId;
			iFrameConfig.platformKey = embeddedservice_bootstrap.settings.platformKey;
			iFrameConfig.inAppEndpointUrl = embeddedservice_bootstrap.settings.inAppEndpointUrl || undefined;

			iFrame.src = embeddedservice_bootstrap.settings.embeddedServiceConfig.siteUrl
				+ "/embeddedService/embeddedService.app?configuration="
				+ encodeURIComponent(JSON.stringify(iFrameConfig));

			iFrame.title = "Chat with an Agent";
			iFrame.className = "embeddedMessagingFrame";
			iFrame.id = "embeddedMessagingFrame";
			iFrame.style.backgroundColor = "transparent";
			iFrame.allowTransparency = "true";
			// TODO: remove allow-same-origin when Aura/LWR allows
			iFrame.sandbox = "allow-scripts allow-same-origin";
			iFrame.onload = () => {
				log("Created an iframe to load the aura application.");
			};

			document.body.appendChild(iFrame);
		} catch(e) {
			throw new Error(e);
		}
	}

	/**
	 * On clicking the button, create an iframe with a site endpoint as experienceSiteEndpointURL along with passing necessary config values as query params.
	 */
	function handleClick() {
		let button = document.getElementById(CONVERSATION_BUTTON_CLASS);

		// eslint-disable-next-line no-negated-condition
		if(!button.classList.contains("embeddedMessagingConversationButtonLoaded")) {
			setLoadingStatusForButton();

			try {
				createIframe();
			} catch(err) {
				error(err);
			}
		} else {
			let iFrame = document.getElementById("embeddedMessagingFrame");

			if(iFrame) {
				// Minimize the chat if it is already maximized.
				iFrame.classList.remove(IFRAME_ROUNDED_CLASS);
				iFrame.classList.add(IFRAME_NO_SHADOW_CLASS);
				iFrame.contentWindow.postMessage(
					{
						method: APP_MINIMIZE_EVENT_NAME,
						parentOrigin: window.location.href
					},
					embeddedservice_bootstrap.settings.embeddedServiceConfig.siteUrl + "/embeddedService/embeddedService.app");
			} else {
				error("Failed to locate the iframe/chat widget");
			}
		}
	}

	/**
	 * Show a button when the container page is loaded.
	 */
	EmbeddedServiceBootstrap.prototype.showConversationButton = function showConversationButton() {
		let conversationButtonWrapper = document.createElement("div");
		let conversationButton = document.createElement("button");
		let iconContainer = document.createElement("div");
		let iconElement;

		conversationButtonWrapper.className = CONVERSATION_BUTTON_WRAPPER_CLASS;
		conversationButton.classList.add(CONVERSATION_BUTTON_CLASS, CONVERSATION_BUTTON_POSITION_CLASS);
		conversationButton.id = CONVERSATION_BUTTON_CLASS;
		conversationButton.href = "javascript:void(0)";

		// Click event handler for the conversation button.
		conversationButton.addEventListener("click", (e) => handleClick());

		iconElement = renderSVG(DEFAULT_ICONS.CHAT);
		iconElement.setAttribute("id", "embeddedMessagingIconChat");
		iconElement.setAttribute("class", "embeddedMessagingIconChat");

		iconContainer.className = "embeddedMessagingIconContainer";
		iconContainer.id = "embeddedMessagingIconContainer";

		iconContainer.appendChild(iconElement);
		conversationButton.appendChild(iconContainer);
		conversationButtonWrapper.appendChild(conversationButton);
		document.body.appendChild(conversationButtonWrapper);
	};

	/**
	 * Maximize the iframe which holds the aura application. Use branding width/height if screen is
	 * big enough, else just fill what we have.
	 * @param {Object} iframe - Reference to iframe DOM element.
	 */
	EmbeddedServiceBootstrap.prototype.maximizeIframe = function maximizeIframe(frame) {
		let button = document.getElementById(CONVERSATION_BUTTON_CLASS);

		applyDynamicStylesToIframe(frame);
		frame.classList.remove(CONVERSATION_BUTTON_POSITION_CLASS);
		frame.classList.remove(IFRAME_ROUNDED_CLASS);
		frame.classList.remove(IFRAME_NO_SHADOW_CLASS);
		button.style.display = "block";
	};

	/**
	 * Resize iframe to fit over button dimensions
	 */
	EmbeddedServiceBootstrap.prototype.minimizeIframe = function minimizeIframe(frame, data) {
		let button = document.getElementById(CONVERSATION_BUTTON_CLASS);
		const height = data.height;
		const width = data.width;

		if (height === width) {
			frame.classList.add(IFRAME_ROUNDED_CLASS);
		}
		frame.style.height = height;
		frame.style.width = width;
		frame.classList.add(IFRAME_NO_SHADOW_CLASS);
		frame.classList.add(CONVERSATION_BUTTON_POSITION_CLASS);

		// `showStaticButton` data comes from close container event.
		if (data && data.detail && data.detail.showStaticButton) {
			button.style.display = "block";
		} else {
			button.style.display = "none";
		}
	};

	window.embeddedservice_bootstrap = new EmbeddedServiceBootstrap();
})();
