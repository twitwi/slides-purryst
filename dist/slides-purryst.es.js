import { Fragment as e, Teleport as t, computed as n, createApp as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createTextVNode as c, createVNode as l, defineAsyncComponent as u, defineComponent as d, inject as f, mergeProps as p, nextTick as m, normalizeClass as h, normalizeProps as g, normalizeStyle as _, onMounted as v, onUnmounted as y, onUpdated as b, openBlock as x, provide as S, reactive as C, ref as w, renderList as T, renderSlot as E, resolveDynamicComponent as D, shallowRef as O, toDisplayString as k, unref as A, useSlots as j, vModelText as M, vShow as N, watch as P, watchEffect as ee, withDirectives as te, withKeys as F, withModifiers as I } from "vue";
//#region \0rolldown/runtime.js
var ne = Object.defineProperty, L = (e, t) => {
	let n = {};
	for (var r in e) ne(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || ne(n, Symbol.toStringTag, { value: "Module" }), n;
}, R = new Set("area base br col embed hr img input link meta param> source track wbr".split(" "));
function z(e) {
	if (e.nodeType === Node.TEXT_NODE) return e.textContent || "";
	if (e.nodeType === Node.COMMENT_NODE) return `<!--${e.textContent}-->`;
	if (e.nodeType !== Node.ELEMENT_NODE) return "";
	let t = e, n = t.tagName.toLowerCase();
	if (n === "sp-notes") return "";
	if (R.has(n)) {
		let e = `<${n}`;
		for (let n = 0; n < t.attributes.length; n++) {
			let r = t.attributes[n];
			e += ` ${r.name}="${r.value.replace(/"/g, "&quot;")}"`;
		}
		return e += " >", e;
	}
	let r = `<${n}`;
	for (let e = 0; e < t.attributes.length; e++) {
		let n = t.attributes[e];
		r += ` ${n.name}="${n.value.replace(/"/g, "&quot;")}"`;
	}
	r += ">";
	let i = n === "template" ? t.content.childNodes : t.childNodes;
	for (let e = 0; e < i.length; e++) r += z(i[e]);
	return r += `</${n}>`, r;
}
function B(e) {
	let t = "";
	for (let n = 0; n < e.childNodes.length; n++) t += z(e.childNodes[n]);
	return t;
}
function re(e, t) {
	e.querySelectorAll("sp-before").forEach((e) => {
		let n = B(e).trim();
		n && (t.before = (t.before ?? "") + n);
	}), e.querySelectorAll("sp-after").forEach((e) => {
		let n = B(e).trim();
		n && (t.after = (t.after ?? "") + n);
	});
}
function ie(e) {
	let t = e.querySelectorAll("sp-slide"), n = [];
	return t.forEach((e, t) => {
		let r = B(e).trim();
		if (!r) return;
		let i = e.getAttribute("notes") ?? void 0;
		if (!i) {
			let t = e.querySelector("sp-notes");
			t && (i = B(t).trim());
		}
		n.push({
			html: r,
			editableIndex: parseInt(e.getAttribute(":editable-index") || "0", 10),
			num: parseInt(e.getAttribute("num") || "0", 10) || t + 1,
			steps: parseInt(e.getAttribute("steps") || "0", 10),
			transition: e.getAttribute("transition") || "",
			class: e.getAttribute("class") || void 0,
			transitionDuration: e.hasAttribute("transition-duration") ? parseFloat(e.getAttribute("transition-duration")) : void 0,
			noToc: e.hasAttribute("no-toc"),
			fakeEnd: e.hasAttribute("fake-end"),
			notes: i
		});
	}), n;
}
function ae(e) {
	let t = [], n = 0;
	for (; n < e.length;) {
		let r = e.indexOf("<sp-slide", n);
		if (r === -1) break;
		let i = e.indexOf("</sp-slide>", r);
		if (i === -1) break;
		t.push(e.slice(r, i + 11).trim().replace(/<span[^>]*data-source-file-(?:push|pop)[^>]*><\/span>/g, "")), n = i + 11;
	}
	return t;
}
function oe(e) {
	let t = w(e ?? []), r = w(0), i = n(() => t.value[r.value] ?? null), a = n(() => t.value.length);
	function o(e) {
		e >= 0 && e < t.value.length && (r.value = e);
	}
	function s() {
		r.value < t.value.length - 1 && r.value++;
	}
	function c() {
		r.value > 0 && r.value--;
	}
	function l(e) {
		t.value = e;
	}
	return {
		slides: t,
		currentIndex: r,
		current: i,
		total: a,
		goTo: o,
		nextSlide: s,
		prevSlide: c,
		setSlides: l
	};
}
//#endregion
//#region src/sp-api.ts
var V = C({
	navLocked: !1,
	currentIndex: 0,
	stepIndex: 0,
	total: 0,
	effectiveLast: 0,
	effectiveTotal: 0,
	fakeEndIndices: [],
	toggleNavLock: () => {},
	goTo: (e) => {},
	next: () => {},
	prev: () => {},
	nextSlide: () => {},
	prevSlide: () => {},
	export: () => {},
	dragging: !1,
	config: {},
	_animCommands: {},
	_animActionTypes: {},
	showChunkBar: !1,
	chunkletDefs: [],
	chunkletMode: !1,
	selectedChunklet: null
}), se = {};
//#endregion
//#region src/animCommands.ts
function H(e) {
	let t = [], n = "", r = null;
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		r ? a === r ? r = null : n += a : a === "\"" || a === "'" ? r = a : a === "," ? (t.push(n.trim()), n = "") : n += a;
	}
	return t.push(n.trim()), t;
}
var U = {
	show: {
		apply(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.classList.add("sp-anim-shown"), n.classList.remove("sp-anim-hidden");
		},
		reverse(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.classList.add("sp-anim-hidden"), n.classList.remove("sp-anim-shown");
		},
		init(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.setAttribute("data-sp-animated", "true"), n.classList.add("sp-anim-hidden"), n.classList.remove("sp-anim-shown");
		}
	},
	hide: {
		apply(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.classList.add("sp-anim-hidden"), n.classList.remove("sp-anim-shown");
		},
		reverse(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.classList.add("sp-anim-shown"), n.classList.remove("sp-anim-hidden");
		},
		init(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.setAttribute("data-sp-animated", "true"), n.classList.add("sp-anim-shown"), n.classList.remove("sp-anim-hidden");
		}
	},
	addClass: {
		apply(e, t) {
			t.className;
			for (let n of e.querySelectorAll(t.selector)) n.classList.add(t.className);
		},
		reverse(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.classList.remove(t.className);
		},
		init(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.setAttribute("data-sp-animated", "true");
		}
	},
	removeClass: {
		apply(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.classList.remove(t.className);
		},
		reverse(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.classList.add(t.className);
		},
		init(e, t) {
			if (t.className) for (let n of e.querySelectorAll(t.selector)) n.setAttribute("data-sp-animated", "true");
		}
	},
	play: {
		apply(e, t) {
			for (let n of e.querySelectorAll(t.selector)) t.rewind && (n.currentTime = 0), n.play().catch(() => {});
		},
		reverse(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.pause();
		},
		init(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.pause(), n.currentTime = 0;
		}
	},
	pause: {
		apply(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.pause();
		},
		reverse(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.play().catch(() => {});
		},
		init(e, t) {
			for (let n of e.querySelectorAll(t.selector)) n.pause();
		}
	}
};
function ce(e, t) {
	let n = [], r = t.querySelector(e);
	if (r) for (let t = 0; t < r.children.length; t++) n.push({
		type: "show",
		selector: `${e} > :nth-child(${t + 1})`
	});
	return n;
}
V._animCommands = {
	children: {
		countSteps(e, t) {
			if (!t) return 1;
			let n = t.querySelector(e);
			return n ? Math.max(1, n.children.length) : 1;
		},
		parse() {
			return [];
		},
		expand(e, t) {
			return ce(e, t).map((e) => [e]);
		},
		init(e, t) {
			let n = t.querySelector(e);
			if (n) for (let e of n.children) e.classList.add("sp-anim-hidden"), e.classList.remove("sp-anim-shown");
		}
	},
	add: {
		countSteps: () => 1,
		parse(e) {
			let t = H(e);
			return [{
				type: "addClass",
				className: t[0] ?? "",
				selector: t.slice(1).join(",")
			}];
		}
	},
	remove: {
		countSteps: () => 1,
		parse(e) {
			let t = H(e);
			return [{
				type: "removeClass",
				className: t[0] ?? "",
				selector: t.slice(1).join(",")
			}];
		}
	},
	"+class": {
		countSteps: () => 1,
		parse(e) {
			let t = e.trim().split(/\s+/);
			return [{
				type: "addClass",
				className: t[0] ?? "",
				selector: t.slice(1).join(" ")
			}];
		}
	},
	"-class": {
		countSteps: () => 1,
		parse(e) {
			let t = e.trim().split(/\s+/);
			return [{
				type: "removeClass",
				className: t[0] ?? "",
				selector: t.slice(1).join(" ")
			}];
		}
	},
	play: {
		countSteps: () => 1,
		parse(e) {
			let t = H(e);
			return [{
				type: "play",
				selector: t[0] || "video",
				rewind: t.slice(1).includes("rewind")
			}];
		}
	},
	pause: {
		countSteps: () => 1,
		parse(e) {
			return [{
				type: "pause",
				selector: H(e)[0] || "video"
			}];
		}
	}
}, V._animActionTypes = { ...U };
function W(e) {
	return V._animCommands[e];
}
function le(e, t) {
	V._animCommands[e] = t;
}
function ue() {
	return Object.keys(V._animCommands);
}
function de(e, t) {
	V._animActionTypes[e] = t;
}
function fe() {
	return Object.keys(V._animActionTypes);
}
//#endregion
//#region src/plugin.ts
function pe(e) {
	let t = document.createElement("style");
	t.textContent = e, document.head.appendChild(t);
}
var G = {
	_plugins: [],
	_keymapSetups: [],
	_animCommands: [],
	_animActionTypes: [],
	_domTransforms: [],
	_teardowns: /* @__PURE__ */ new Map(),
	async register(e) {
		this._plugins.push(e);
		let t = () => {}, n = e.disable ?? [], r = {
			spApi: V,
			addKeymapSetup: n.includes("keymap") ? t : (e) => this._keymapSetups.push(e),
			addAnimCommand: n.includes("anim") ? t : (e, t) => this._animCommands.push({
				name: e,
				handler: t
			}),
			addAnimActionType: n.includes("anim") ? t : (e, t) => this._animActionTypes.push({
				type: e,
				handler: t
			}),
			injectStyle: n.includes("style") ? t : pe,
			addChunklet: n.includes("chunklet") ? t : (e) => V.chunkletDefs.push(e),
			addDomTransform: n.includes("domTransform") ? t : (e) => this._domTransforms.push(e)
		}, i = e.activate(r), a = i instanceof Promise ? await i : i;
		if (a) {
			let t = this._teardowns.get(e.name) ?? [];
			t.push(a), this._teardowns.set(e.name, t);
		}
	},
	applyAnimRegistrations() {
		for (let { name: e, handler: t } of this._animCommands) le(e, t);
		for (let { type: e, handler: t } of this._animActionTypes) de(e, t);
	},
	unregister(e) {
		let t = this._plugins.findIndex((t) => t.name === e);
		t < 0 || ((this._teardowns.get(e) ?? []).forEach((e) => e()), this._teardowns.delete(e), this._plugins.splice(t, 1));
	}
};
function K(e) {
	return e;
}
var q = w([]);
function J(e) {
	q.value.length >= 10 && q.value.shift(), q.value.push(e);
}
function me() {
	q.value = [];
}
//#endregion
//#region src/composables/useSteps.ts
function he(e, t) {
	if (!e.trim()) return 0;
	let n = e.split("|").map((e) => e.trim()), r = 0;
	for (let e of n) {
		let n = e.match(/^@(\w+)\((.+)\)$/);
		if (n) {
			let e = W(n[1]);
			e ? r += e.countSteps(n[2], t) : r += 1;
		} else r += 1;
	}
	return r;
}
function ge(e) {
	return !e || e === "+1" ? {
		relative: !0,
		value: 1
	} : (e = e.trim(), e.startsWith("+") || e.startsWith("-") ? {
		relative: !0,
		value: parseInt(e, 10)
	} : {
		relative: !1,
		value: parseInt(e, 10)
	});
}
var _e = /* @__PURE__ */ RegExp("<(sp-anim|sp-jump|sp-pause|sp-meanwhile|sp-toc|sp-include|sp-svg|sp-slide-source)(\\s[^>]*)?/>", "gi"), ve = /* @__PURE__ */ RegExp("<(sp-drag|sp-slide)(\\s[^>]*)?(/?)>", "gi");
function ye(e) {
	return e.replace(_e, "<$1$2></$1>");
}
function be(e) {
	let t = 0;
	return e.replace(ve, (e, n, r, i) => {
		let a = `<${n} :editable-index="${t}"${i || ""}${r || ""}>`;
		return (r ?? "").includes(":editable-index=") ? e : (t++, a);
	});
}
function xe(e) {
	e.querySelectorAll("sp-pause").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "+1"), e.replaceWith(t);
	}), e.querySelectorAll("sp-meanwhile").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "0"), e.replaceWith(t);
	});
}
function Se(e) {
	let t = 0, n = (e) => {
		let r = Array.from(e.children);
		for (let e of r) e.tagName.toLowerCase() === "sp-step" && (e.getAttribute("also") === null ? t = parseInt(e.getAttribute("from") || "0", 10) : (e.setAttribute("from", String(t)), e.removeAttribute("also"))), n(e);
	};
	n(e);
}
function Ce(e) {
	e.querySelectorAll("sp-step").forEach((e) => {
		let t = e.getAttribute("from"), n = e.getAttribute("to"), r = e.getAttribute("until"), i = e.getAttribute("only"), a = e.getAttribute("hide"), o = e.getAttribute("animation");
		function s(e) {
			if (t !== null && e.setAttribute("data-sp-step-from", t), n !== null && e.setAttribute("data-sp-step-to", n), r !== null) {
				let t = parseInt(r, 10);
				isNaN(t) || e.setAttribute("data-sp-step-to", String(t - 1));
			}
			i !== null && (e.setAttribute("data-sp-step-from", i), e.setAttribute("data-sp-step-to", i)), a !== null && e.setAttribute("data-sp-step-hide", ""), o && e.setAttribute("data-sp-step-animation", o);
		}
		let c = Array.from(e.children);
		if (c.length > 0) c.forEach(s), e.replaceWith(...Array.from(e.childNodes));
		else {
			let t = document.createElement("span");
			s(t), t.innerHTML = e.innerHTML, e.replaceWith(t);
		}
	});
}
function we(e) {
	let t = 0, n = 0;
	e.querySelectorAll("[data-sp-step]").forEach((e) => {
		let t = parseInt(e.getAttribute("data-sp-step") || "0", 10);
		t > n && (n = t);
	}), e.querySelectorAll("[data-sp-step-from]").forEach((e) => {
		let t = parseInt(e.getAttribute("data-sp-step-from") || "0", 10);
		t > n && (n = t);
	}), e.querySelectorAll("[data-sp-step-to]").forEach((e) => {
		let t = parseInt(e.getAttribute("data-sp-step-to") || "0", 10);
		t > n && (n = t);
	});
	function r(e) {
		e > n && (n = e);
	}
	function i(n) {
		let a = Array.from(n.children), o = [];
		for (let n of a) {
			let a = n.tagName.toLowerCase(), s = !1, c = !1;
			if (a !== "sp-style") {
				if (a === "sp-jump") {
					let { relative: e, value: i } = ge(n.getAttribute("at"));
					e ? t += i : t = i, o.push(n), r(t);
					continue;
				}
				if (a === "sp-anim") {
					let i = [null, "false"].includes(n.getAttribute("no-jump")), a = n.getAttribute("at") ?? "+0", o = t, { relative: s, value: c } = ge(a);
					s ? o += c : o = c - 1, n.setAttribute("at", String(o));
					try {
						o += he(n.getAttribute("spec") || "", e);
					} catch (e) {
						console.error("(Caught) Error counting anim spec parts:", e), J(`Error counting anim spec parts for <sp-anim> at step ${t}: ${e}`);
					}
					i ? (t = o, r(t)) : r(o);
				}
				if (a === "sp-alternatives") {
					let { relative: e, value: i } = ge(n.getAttribute("at") ?? "+0");
					e ? t += i : t = i, t += n.childElementCount, r(t - 1), s = !0, c = !0;
				}
				if (a === "sp-steps" || !s && n.hasAttribute("sp-steps")) {
					let e = n.getAttribute("at") ?? "+1", i = [null, "false"].includes(n.getAttribute("no-jump")), o = parseInt(n.getAttribute("every") || "1", 10), l = n.getAttribute("animation") || "", u = t, d = ge(e);
					d.relative ? u += d.value : u = d.value;
					let f = Array.from(n.children), p = Math.ceil(f.length / o);
					f.forEach((e, t) => {
						e.setAttribute("data-sp-step", String(u + Math.floor(t / o))), l && e.setAttribute("data-sp-step-animation", l);
					});
					let m = u + p - 1;
					if (i ? (t = m, r(t)) : r(m), a === "sp-steps") {
						let e = document.createElement("div");
						e.classList.add("sp-steps-no-tag");
						for (let t of Array.from(n.attributes)) [
							"at",
							"every",
							"animation",
							"no-jump"
						].includes(t.name) || e.setAttribute(t.name, t.value);
						for (; n.firstChild;) e.appendChild(n.firstChild);
						n.replaceWith(e);
					} else n.removeAttribute("sp-steps"), n.removeAttribute("at"), n.removeAttribute("every"), n.removeAttribute("animation"), n.removeAttribute("no-jump");
					s = !0, c = !0;
					continue;
				}
				!s && t > 0 && !n.hasAttribute("data-sp-step") && n.setAttribute("data-sp-step", String(t)), c || i(n);
			}
		}
		for (let e of o) e.remove();
	}
	return i(e), n + 1;
}
function Te(e) {
	for (let t of G._domTransforms) t(e);
}
function Y(e) {
	let t = document.createElement("div");
	t.innerHTML = e, xe(t), Se(t), Ce(t);
	let n = we(t);
	return Te(t), {
		html: t.innerHTML,
		steps: n
	};
}
function Ee() {
	let e = w(0), t = w(1), r = n(() => e.value === 0), i = n(() => t.value <= 1 || e.value >= t.value - 1);
	function a() {
		e.value < t.value - 1 && e.value++;
	}
	function o() {
		e.value > 0 && e.value--;
	}
	return {
		stepIndex: e,
		totalSteps: t,
		isFirstStep: r,
		isLastStep: i,
		nextStep: a,
		prevStep: o,
		processSlideHtml: Y
	};
}
//#endregion
//#region src/composables/includeCache.ts
var X = /* @__PURE__ */ new Map(), De = /* @__PURE__ */ new Map(), Oe = /* @__PURE__ */ new Map(), ke = /* @__PURE__ */ new Map(), Ae = [];
function je(e) {
	Ae = e.map((e) => new RegExp(e));
}
function Me(e) {
	return Ae.some((t) => t.test(e));
}
var Z = /* @__PURE__ */ new Map();
function Ne(e, t) {
	Z.set(e, {
		size: t ? t.length : 0,
		timestamp: Date.now()
	});
}
function Pe(e) {
	let t = X.get(e);
	return t || (t = w(void 0), X.set(e, t)), t;
}
function Fe(e) {
	let t = De.get(e);
	return t || (t = w(void 0), De.set(e, t)), t;
}
function Ie(e) {
	if (Me(e)) return Promise.resolve();
	let t = Pe(e);
	if (t.value !== void 0) return Promise.resolve();
	if (Oe.has(e)) return Oe.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.text();
	}).then((n) => {
		t.value = n, Ne(e, n), Oe.delete(e);
	}).catch(() => {
		t.value = "", Ne(e), Oe.delete(e);
	});
	return Oe.set(e, n), n;
}
function Le(e) {
	if (Me(e)) return Promise.resolve();
	let t = Fe(e);
	if (t.value !== void 0) return Promise.resolve();
	if (ke.has(e)) return ke.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.blob();
	}).then((e) => new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(r.result), r.onerror = n, r.readAsDataURL(e);
	})).then((n) => {
		t.value = n, Ne(e, n), ke.delete(e);
	}).catch(() => {
		t.value = "", Ne(e), ke.delete(e);
	});
	return ke.set(e, n), n;
}
function Re() {
	let e = {};
	for (let [t, n] of X) n.value !== void 0 && (e[t] = n.value);
	let t = {};
	for (let [e, n] of De) n.value !== void 0 && (t[e] = n.value);
	return JSON.stringify({
		text: e,
		binary: t
	});
}
function ze(e) {
	let t = JSON.parse(e), n = Date.now();
	if (t.text) for (let [e, r] of Object.entries(t.text)) Pe(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
	else for (let [e, r] of Object.entries(t)) Pe(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
	if (t.binary) for (let [e, r] of Object.entries(t.binary)) Fe(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
}
function Be() {
	let e = [];
	for (let [t] of X) {
		let n = Z.get(t);
		e.push({
			path: t,
			size: n?.size ?? 0,
			timestamp: n?.timestamp ?? 0,
			type: "text"
		});
	}
	for (let [t] of De) {
		let n = Z.get(t);
		e.push({
			path: t,
			size: n?.size ?? 0,
			timestamp: n?.timestamp ?? 0,
			type: "binary"
		});
	}
	return e.sort((e, t) => t.timestamp - e.timestamp);
}
function Ve() {
	for (let e of X.values()) e.value = void 0;
	for (let [e] of X) Z.delete(e);
	Oe.clear();
}
function He(e) {
	let t = window.location.href, n = new URL(e, t).href;
	for (let [e, r] of X) try {
		if (new URL(e, t).href === n) {
			r.value = void 0, Z.delete(e), Oe.delete(e);
			return;
		}
	} catch {}
}
function Ue() {
	for (let e of X.values()) e.value = void 0;
	for (let e of De.values()) e.value = void 0;
	X.clear(), De.clear(), Z.clear(), Oe.clear(), ke.clear();
}
function We(e) {
	let t = X.get(e);
	t && (t.value = void 0);
	let n = De.get(e);
	n && (n.value = void 0), Z.delete(e);
}
//#endregion
//#region src/composables/resolveIncludes.ts
async function Ge(e) {
	let t = Pe(e);
	if (t.value !== void 0) return t.value;
	try {
		let n = await fetch(e);
		if (!n.ok) return "";
		let r = await n.text();
		return t.value = r, r;
	} catch {
		return "";
	}
}
function Ke(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function Q(e, t = /* @__PURE__ */ new Set(), n = window.location.pathname) {
	let r = /<sp-include\s[^>]*?src="([^"]*)"[^>]*?(\/>|><\/sp-include>)/g, i = `<span style="display:none" data-source-file-push="${n}"></span>`;
	e = e.replace(/<sp-slide[^>]*>/g, (e) => e + i).replace(/<\/sp-slide>/g, (e) => "<span style=\"display:none\" data-source-file-pop></span>" + e);
	let a = [], o;
	for (; (o = r.exec(e)) !== null;) a.push({
		src: o[1],
		index: o.index
	});
	if (a.length === 0) return e;
	let s = a.filter(({ index: t }) => {
		let n = e.slice(0, t);
		return (n.match(/<sp-slide[\s>]/g) || []).length === (n.match(/<\/sp-slide>/g) || []).length;
	}).filter(({ src: e }) => !t.has(e));
	if (s.length === 0) return e;
	let c = await Promise.all(s.map(async ({ src: e }) => {
		t.add(e);
		try {
			let n = await Ge(e);
			return n = ye(n), n = be(n), {
				src: e,
				content: await Q(n, t, e)
			};
		} catch {
			return {
				src: e,
				content: ""
			};
		}
	})), l = e;
	for (let { src: e, content: t } of c) {
		if (!t) continue;
		let n = RegExp(`<sp-include[^>]*?src="${Ke(e)}"[^>]*?(\\/?>|><\\/sp-include>)`, "g");
		l = l.replace(n, t);
	}
	return l;
}
function qe(e) {
	if (!e) return null;
	let t = [];
	function n(e) {
		function r(e) {
			let n = e.getAttribute("data-source-file-push");
			n && t.push(n), e.hasAttribute("data-source-file-pop") && t.pop();
		}
		let i = "[data-source-file-push],[data-source-file-pop]";
		if (e.parentElement === null) return;
		n(e.parentElement);
		let a = e.parentElement?.children[0];
		for (; a !== e && a !== null;) a.matches(i) && r(a), a.querySelectorAll(i).forEach(r), a = a?.nextElementSibling;
	}
	if (n(e), t.length === 0) return null;
	let r = t[0];
	for (let e = 1; e < t.length; e++) {
		let n = t[e];
		if (n.startsWith("/")) r = n;
		else {
			let e = r.lastIndexOf("/");
			r = r.slice(0, e + 1) + n;
		}
	}
	return r;
}
//#endregion
//#region node_modules/.pnpm/tinykeys@4.0.0/node_modules/tinykeys/dist/tinykeys.mjs
var Je = [
	"Shift",
	"Meta",
	"Alt",
	"Control"
], Ye = 1e3, $ = "keydown", Xe = typeof navigator == "object" ? navigator.platform : "", Ze = /Mac|iPod|iPhone|iPad/.test(Xe) ? "Meta" : "Control", Qe = Xe === "Win32" ? ["Control", "Alt"] : ["Alt"];
function $e(e) {
	return !!(e.key && e.code && e.getModifierState);
}
function et(e) {
	let t = e.target;
	return e.repeat || e.isComposing || t !== e.currentTarget && t.matches("[contenteditable],input,select,textarea");
}
function tt(e, t) {
	return typeof e.getModifierState == "function" ? e.getModifierState(t) || Qe.includes(t) && e.getModifierState("AltGraph") : !1;
}
function nt(e) {
	return e.trim().split(" ").map((e) => {
		let t = e.split(/(?<=\w|\])\+/), n = t.pop(), r = n.match(/^\((.+)\)$/), i = r ? RegExp(`^(?:${r[1]})$`, "iv") : n, a = [], o = [];
		for (let e of t) {
			let t = e.match(/^\[(.*)\]$/), n = t?.[1] ?? e;
			n = n === "$mod" ? Ze : n, t ? o.push(n) : a.push(n);
		}
		return [
			a,
			o,
			i
		];
	});
}
function rt(e, [t, n, r]) {
	let i = t.includes("AltGraph");
	return !((r instanceof RegExp ? !(r.test(e.key) || r.test(e.code)) : r.toUpperCase() !== e.key.toUpperCase() && r !== e.code) || t.find((t) => !tt(e, t)) || Je.find((a) => !t.includes(a) && !n.includes(a) && r !== a && tt(e, a) && !(i && Qe.includes(a))));
}
function it(e, t = {}) {
	let n = t.timeout ?? Ye, r = t.ignore ?? et, i = Object.keys(e).map((t) => [
		t,
		nt(t),
		e[t]
	]), a = /* @__PURE__ */ new Map(), o = null;
	return (e) => {
		if (!$e(e) || r(e)) return;
		let t = [];
		for (let [n, r, o] of i) {
			let [i, ...s] = a.get(n) || r;
			if (!rt(e, i)) tt(e, e.key) || a.delete(n);
			else if (s.length > 0) a.set(n, s), t.push(n);
			else if (a.delete(n), t.length) console.warn(`tinykeys: Conflict found, "${n}" did not fire, waiting for:`, t);
			else {
				o(e);
				break;
			}
		}
		o && clearTimeout(o), o = setTimeout(() => a.clear(), n);
	};
}
function at(e, t, n = {}) {
	let r = n.event ?? $, i = it(t, n);
	return e.addEventListener(r, i, n.capture), () => {
		e.removeEventListener(r, i, n.capture);
	};
}
//#endregion
//#region src/keymap/manager.ts
var ot = class {
	constructor(e) {
		this._setups = [], this._unsubscribe = null, this._getContext = e;
	}
	addSetup(e) {
		this._setups.push(e);
	}
	removeSetup(e) {
		let t = this._setups.indexOf(e);
		t >= 0 && this._setups.splice(t, 1);
	}
	_resolve() {
		let e = {};
		for (let t of this._setups) t(e);
		return e;
	}
	_wrapHandlers(e) {
		let t = {};
		for (let [n, r] of Object.entries(e)) {
			let e = r.__bind, i = e?.when, a = e?.preventDefault !== !1;
			t[n] = (e) => {
				i && !i(this._getContext()) || (a && e.preventDefault(), r(e));
			};
		}
		return t;
	}
	rebuild() {
		this._unsubscribe?.();
		let e = this._resolve(), t = this._wrapHandlers(e);
		this._unsubscribe = at(window, t, { ignore: (e) => et(e) || this._getContext().dragging });
	}
	mount() {
		this.rebuild();
	}
	unmount() {
		this._unsubscribe?.(), this._unsubscribe = null;
	}
};
//#endregion
//#region src/keymap/useKeymap.ts
function st(e) {
	let t = new ot(e.getContext);
	for (let n of e.setupFns ?? []) t.addSetup(n);
	function n(e) {
		t.addSetup(e), t.rebuild();
	}
	function r(e) {
		t.removeSetup(e), t.rebuild();
	}
	return v(() => t.mount()), y(() => t.unmount()), {
		addSetup: n,
		removeSetup: r,
		rebuild: () => t.rebuild()
	};
}
//#endregion
//#region src/keymap/bind.ts
function ct(e, t) {
	let n = (t) => e(t);
	return t && (n.__bind = t), n;
}
//#endregion
//#region src/keymap/defaults.ts
function lt(e) {
	return (t) => {
		t.ArrowRight = t.Space = () => e.next(), t.ArrowLeft = () => e.prev(), t.ArrowUp = () => e.goToPrevBegin(), t.ArrowDown = () => e.goToNextBegin(), t.a = () => e.goToPrevEnd(), t.z = () => e.goToNextEnd(), t.Home = () => e.goTo(0), t.End = () => e.goTo(e.total.value - 1), t.f = ct(() => {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}, { preventDefault: !1 }), t.Escape = ct(() => {
			document.fullscreenElement && document.exitFullscreen().catch(() => {}), e.onOverviewExit?.(), e.onBlackoutExit?.();
		}, { preventDefault: !1 }), t.p = () => e.onPresenterToggle?.(), t.o = () => e.onOverviewToggle?.(), t.g = () => e.onGoPrompt?.(), t.b = () => e.onBlackoutToggle?.(), t.d = () => e.onDevPaneToggle?.(), t.c = () => e.onChunkBarToggle?.();
	};
}
//#endregion
//#region src/composables/useNavigation.ts
function ut(e, t) {
	let n = [lt(e), ...t?.extraSetups ?? []], { rebuild: r } = st({
		getContext: t?.getContext ?? (() => ({
			overview: !1,
			presenter: !1,
			blackout: !1,
			devPane: !1,
			dragging: V.dragging,
			goPrompt: !1
		})),
		setupFns: n
	}), i = 0, a = 0;
	function o(e) {
		i = e.touches[0].clientX, a = e.touches[0].clientY;
	}
	function s(t) {
		if (V.dragging) return;
		let n = t.changedTouches[0].clientX - i, r = t.changedTouches[0].clientY - a;
		Math.abs(n) < 30 && Math.abs(r) < 30 || Math.abs(n) < Math.abs(r) || (n < 0 ? e.isLastStep.value ? e.currentIndex.value < e.total.value - 1 && e.next() : e.nextStep() : e.isFirstStep.value ? e.currentIndex.value > 0 && e.prev() : e.prevStep());
	}
	return v(() => {
		window.addEventListener("touchstart", o, { passive: !0 }), window.addEventListener("touchend", s, { passive: !0 });
	}), y(() => {
		window.removeEventListener("touchstart", o), window.removeEventListener("touchend", s);
	}), { rebuildKeymap: r };
}
//#endregion
//#region src/composables/usePresenter.ts
function dt() {
	let e = w(null), t = null;
	try {
		t = new BroadcastChannel("sp-presenter");
	} catch {}
	let r = /* @__PURE__ */ new Map();
	t && t.addEventListener("message", (e) => {
		let t = e.data ?? {}, n = r.get(t.type);
		n && n.forEach((e) => e(t));
	});
	let i = n(() => e.value !== null && !e.value.closed);
	function a() {
		let t = new URL(window.location.href);
		t.searchParams.set("presenter", "1");
		let n = window.open(t.toString(), "sp-presenter", "width=1280,height=720");
		n && (e.value = n);
	}
	function o() {
		e.value && !e.value.closed && e.value.close(), e.value = null;
	}
	function s(e, n) {
		t?.postMessage(n === void 0 ? { type: e } : {
			type: e,
			...n
		});
	}
	function c(e, t) {
		return r.has(e) || r.set(e, /* @__PURE__ */ new Set()), r.get(e).add(t), () => r.get(e)?.delete(t);
	}
	function l(e, t) {
		s("sync", {
			slide: e,
			step: t
		});
	}
	function u(e) {
		s("blackout", { active: e });
	}
	return y(() => {
		t?.close();
	}), {
		presenterWindow: e,
		presenterActive: i,
		openPresenterWindow: a,
		closePresenter: o,
		send: s,
		onMessage: c,
		syncState: l,
		syncBlackout: u,
		channel: t
	};
}
//#endregion
//#region src/composables/useScale.ts
function ft(e = 1920, t = 1080) {
	let r = w(window.innerWidth), i = w(window.innerHeight);
	function a() {
		r.value = window.innerWidth, i.value = window.innerHeight;
	}
	let o = n(() => {
		let n = Math.min(r.value / e, i.value / t);
		return Math.min(n, 1);
	}), s = n(() => {
		let n = o.value;
		return {
			transform: `scale(${n}) translate(${(r.value - e * n) / (2 * n)}px, ${(i.value - t * n) / (2 * n)}px)`,
			transformOrigin: "top left",
			width: e + "px",
			height: t + "px"
		};
	}), c = n(() => ({
		width: r.value + "px",
		height: i.value + "px"
	}));
	return v(() => {
		a(), window.addEventListener("resize", a);
	}), y(() => {
		window.removeEventListener("resize", a);
	}), {
		transformStyle: s,
		containerStyle: c
	};
}
//#endregion
//#region src/composables/useStorage.ts
var pt = "sp-config", mt = {
	navLocked: !1,
	overviewScale: .15,
	proMode: !1,
	logSteps: !1,
	darkMode: "light"
};
function ht() {
	try {
		let e = localStorage.getItem(pt);
		return e ? {
			...mt,
			...JSON.parse(e)
		} : { ...mt };
	} catch {
		return { ...mt };
	}
}
var gt = C(ht());
P(gt, () => {
	try {
		localStorage.setItem(pt, JSON.stringify(gt));
	} catch {}
}, { deep: !0 });
function _t() {
	return gt;
}
function vt() {
	for (let e of Object.keys(gt)) e in mt ? gt[e] = mt[e] : delete gt[e];
}
//#endregion
//#region src/components/SpStepManager.vue
var yt = /* @__PURE__ */ d({
	__name: "SpStepManager",
	setup(e) {
		let t = w(null), n = f("stepIndex", { value: 0 }), r = f("contentVersion", { value: 0 }), i = f("animInstances", /* @__PURE__ */ new Set()), a = -1;
		function s() {
			return t.value?.closest(".sp-slide") || t.value?.parentElement;
		}
		function c() {
			let e = s();
			if (!e) return n.value;
			let t = e.querySelector("[data-fixed-step]")?.getAttribute("data-fixed-step");
			return t == null ? n.value : parseInt(t);
		}
		function l(e, t) {
			let n = e.getAttribute("data-sp-step"), r = e.getAttribute("data-sp-step-from"), i = e.getAttribute("data-sp-step-to");
			return r === null ? n === null || t >= parseInt(n, 10) : t < parseInt(r, 10) ? !1 : i === null || t <= parseInt(i, 10);
		}
		function u(e) {
			let t = s();
			t && t.querySelectorAll("[data-sp-step], [data-sp-step-from], [data-sp-step-to], [data-sp-step-hide]").forEach((t) => {
				if (t.closest("[data-sp-animated]") !== null) return;
				let n = l(t, e);
				t.classList.toggle("sp-anim-shown", n), t.classList.toggle("sp-anim-hidden", !n), t.hasAttribute("data-sp-step-hide") && t.classList.toggle("sp-anim-only", !0);
				let r = t.getAttribute("data-sp-step-animation");
				r && t.classList.toggle(`sp-anim-preset-${r}`, !0);
			});
		}
		function d(e, t) {
			let n = s();
			if (n) {
				u(e);
				for (let n of i) n.syncToStep(e, t);
				if (t) for (let e of n.getAnimations({ subtree: !0 })) try {
					let t = e.effect?.getComputedTiming(), r = t && t.iterations !== Infinity, i = e.effect?.target;
					r && i instanceof Element && i === n && (r = !1), r && i instanceof Element && i.closest(".sp-anim-protect") !== null && (r = !1), r && e.finish();
				} catch {}
				a = e;
			}
		}
		return v(() => {
			m(() => d(c(), !0));
		}), P(n, (e) => {
			let t = c();
			t !== a && d(t, Math.abs(t - a) > 1 || a < 0);
		}), P(r, () => {
			a = -1, m(() => d(c(), !0));
		}), (e, n) => (x(), o("span", {
			ref_key: "rootEl",
			ref: t,
			style: { display: "none" }
		}, null, 512));
	}
}), bt = /* @__PURE__ */ d({
	__name: "SpSlide",
	props: {
		slide: {},
		html: {},
		components: {},
		fixedStep: {}
	},
	setup(e) {
		let t = e, r = n(() => {
			let e = ["sp-slide"];
			return t.slide && e.push(`sp-slide-${t.slide.num}`), t.slide?.class && e.push(t.slide.class), e;
		});
		S("slideNum", n(() => t.slide?.num)), S("animInstances", /* @__PURE__ */ new Set());
		let a = O(null);
		return P(() => [t.html, t.fixedStep], ([e, n]) => {
			if (!e) {
				a.value = null;
				return;
			}
			let r = n === void 0 ? "" : ` data-fixed-step="${n}"`, i = {
				"sp-step-manager": yt,
				...t.components
			};
			a.value = d({
				template: `<div${r}>${e}<sp-step-manager /></div>`,
				components: i
			});
		}, { immediate: !0 }), (e, t) => (x(), o("div", { class: h(r.value) }, [(x(), i(D(a.value)))], 2));
	}
}), xt = { class: "sp-dev-pane" }, St = { class: "sp-dev-header" }, Ct = { class: "sp-dev-section" }, wt = {
	key: 0,
	class: "sp-dev-empty"
}, Tt = {
	key: 1,
	class: "sp-dev-table"
}, Et = ["title"], Dt = { class: "sp-dev-num" }, Ot = { class: "sp-dev-num" }, kt = ["onClick"], At = ["disabled"], jt = { class: "sp-dev-section" }, Mt = ["title"], Nt = { class: "sp-dev-section sp-dev-config" }, Pt = { class: "sp-dev-config-fields" }, Ft = { class: "sp-dev-config-label" }, It = {
	key: 0,
	class: "sp-dev-choice-group"
}, Lt = ["onClick"], Rt = ["checked", "onChange"], zt = [
	"min",
	"max",
	"step",
	"value",
	"onInput"
], Bt = ["value", "onInput"], Vt = /* @__PURE__ */ d({
	__name: "SpDevPane",
	props: {
		visible: { type: Boolean },
		exportFn: { type: Function }
	},
	emits: ["close"],
	setup(r, { emit: l }) {
		let u = _t(), d = n(() => {
			let e = {};
			for (let t of Object.keys(u)) e[t] = u[t];
			return JSON.stringify(e, null, 1);
		}), p = {
			navLocked: {
				key: "navLocked",
				type: "boolean"
			},
			overviewScale: {
				key: "overviewScale",
				type: "number",
				min: .05,
				max: .5,
				step: .01
			},
			proMode: {
				key: "proMode",
				type: "boolean"
			},
			logSteps: {
				key: "logSteps",
				type: "boolean"
			},
			darkMode: {
				key: "darkMode",
				type: "choice",
				choices: [
					"light",
					"auto",
					"dark"
				]
			}
		}, m = n(() => Object.keys(u).filter((e) => e !== "proMode" || u.proMode).map((e) => p[e] ?? {
			key: e,
			type: "string"
		})), g = f("liveUpdatesCount", w(0)), _ = w(0), b = null, S = n(() => {
			let e = _.value / 9;
			return e >= 1 ? "done" : e > .66 ? "warm" : e > .33 ? "mid" : "cool";
		});
		function C() {
			if (_.value++, b && clearTimeout(b), _.value >= 9) {
				u.proMode = !0, b = setTimeout(() => {
					_.value = 0;
				}, 1200);
				return;
			}
			b = setTimeout(() => {
				_.value = 0;
			}, 2e3);
		}
		let E = r, D = w(Be()), O = null;
		function j() {
			M(), O = setInterval(() => {
				D.value = Be();
			}, 1e3);
		}
		function M() {
			O !== null && (clearInterval(O), O = null);
		}
		P(() => E.visible, (e) => {
			e ? (D.value = Be(), j()) : M();
		}), v(() => {
			E.visible && j();
		}), y(M);
		function N() {
			Ue(), D.value = Be();
		}
		function ee(e) {
			We(e), D.value = Be();
		}
		function te() {
			E.exportFn?.();
		}
		function F() {
			vt();
		}
		function ne(e) {
			return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(1) + " MB";
		}
		function L(e) {
			if (!e) return "—";
			let t = new Date(e);
			return t.toLocaleTimeString() + " " + t.toLocaleDateString();
		}
		return (n, l) => (x(), i(t, { to: "body" }, [r.visible ? (x(), o("div", {
			key: 0,
			class: "sp-dev-overlay",
			onClick: l[1] ||= I((e) => n.$emit("close"), ["self"])
		}, [s("div", xt, [
			s("div", St, [s("h2", { onClick: C }, [l[2] ||= c(" Dev Tools ", -1), _.value > 0 ? (x(), o("span", {
				key: 0,
				class: h(["sp-dev-title-clicks", S.value])
			}, k(_.value) + "/9", 3)) : a("", !0)]), s("button", {
				class: "sp-dev-close",
				onClick: l[0] ||= (e) => n.$emit("close"),
				"aria-label": "Close"
			}, "×")]),
			s("section", Ct, [
				s("h3", null, "Live Updates (" + k(A(g)) + ")", 1),
				s("h3", null, "Cache (" + k(D.value.length) + " entries)", 1),
				D.value.length === 0 ? (x(), o("div", wt, "No cached entries")) : (x(), o("table", Tt, [l[3] ||= s("thead", null, [s("tr", null, [
					s("th", null, "Path"),
					s("th", null, "Size"),
					s("th", null, "Fetched"),
					s("th", null, "Type"),
					s("th")
				])], -1), s("tbody", null, [(x(!0), o(e, null, T(D.value, (e) => (x(), o("tr", { key: e.path + e.type }, [
					s("td", {
						class: "sp-dev-path",
						title: e.path
					}, k(e.path), 9, Et),
					s("td", Dt, k(ne(e.size)), 1),
					s("td", Ot, k(L(e.timestamp)), 1),
					s("td", null, k(e.type), 1),
					s("td", null, [s("button", {
						class: "sp-dev-del",
						onClick: (t) => ee(e.path),
						title: "Remove entry"
					}, "×", 8, kt)])
				]))), 128))])])),
				s("button", {
					class: "sp-dev-btn",
					onClick: N,
					disabled: D.value.length === 0
				}, " Clear Cache ", 8, At)
			]),
			s("section", jt, [
				l[4] ||= s("h3", null, "Actions", -1),
				s("button", {
					class: "sp-dev-btn",
					onClick: te
				}, "Export Standalone"),
				s("button", {
					class: "sp-dev-btn",
					onClick: F,
					title: d.value
				}, "Clear localStorage Keys", 8, Mt)
			]),
			s("details", Nt, [l[5] ||= s("summary", null, [s("h3", null, "Config")], -1), s("div", Pt, [(x(!0), o(e, null, T(m.value, (t) => (x(), o("label", {
				key: t.key,
				class: "sp-dev-config-field"
			}, [s("span", Ft, k(t.key), 1), t.type === "choice" ? (x(), o("span", It, [(x(!0), o(e, null, T(t.choices, (e) => (x(), o("button", {
				key: e,
				class: h(["sp-dev-choice-btn", { active: A(u)[t.key] === e }]),
				onClick: (n) => A(u)[t.key] = e
			}, k(e), 11, Lt))), 128))])) : t.type === "boolean" ? (x(), o("input", {
				key: 1,
				type: "checkbox",
				checked: !!A(u)[t.key],
				onChange: (e) => A(u)[t.key] = e.target.checked
			}, null, 40, Rt)) : t.type === "number" ? (x(), o("input", {
				key: 2,
				type: "range",
				min: t.min ?? 0,
				max: t.max ?? 1,
				step: t.step ?? .01,
				value: A(u)[t.key],
				onInput: (e) => A(u)[t.key] = parseFloat(e.target.value)
			}, null, 40, zt)) : (x(), o("input", {
				key: 3,
				type: "text",
				value: A(u)[t.key],
				onInput: (e) => A(u)[t.key] = e.target.value
			}, null, 40, Bt))]))), 128))])]),
			l[6] ||= s("footer", { class: "sp-dev-footer" }, [s("small", null, "toolbar ◆ to open")], -1)
		])])) : a("", !0)]));
	}
});
//#endregion
//#region src/composables/useElementScale.ts
function Ht(e, t, r) {
	let i = w(0), a = w(0), o = null;
	function s() {
		let t = e.value;
		t && (i.value = t.clientWidth, a.value = t.clientHeight);
	}
	let c = n(() => {
		if (!i.value || !a.value) return 1;
		let e = Math.min(i.value / t, a.value / r);
		return Math.min(e, 1);
	}), l = n(() => {
		let e = c.value;
		return {
			transform: `scale(${e}) translate(${(i.value - t * e) / (2 * e)}px, ${(a.value - r * e) / (2 * e)}px)`,
			transformOrigin: "top left",
			width: t + "px",
			height: r + "px"
		};
	});
	return v(() => {
		s(), e.value && (o = new ResizeObserver(() => {
			s();
		}), o.observe(e.value));
	}), y(() => {
		o?.disconnect();
	}), { transformStyle: l };
}
//#endregion
//#region src/components/SpPresenterView.vue?vue&type=script&setup=true&lang.ts
var Ut = { class: "sp-presenter-main" }, Wt = { class: "sp-presenter-sidebar" }, Gt = { class: "sp-presenter-info" }, Kt = { class: "sp-presenter-num" }, qt = { class: "sp-presenter-progress" }, Jt = ["title"], Yt = { class: "sp-presenter-clock-time" }, Xt = {
	key: 0,
	class: "sp-presenter-clock-feedback"
}, Zt = { class: "sp-presenter-notes" }, Qt = ["innerHTML"], $t = "sp-presentation-clock", en = "sp-presentation-log", tn = /* @__PURE__ */ d({
	__name: "SpPresenterView",
	props: {
		current: {},
		currentIndex: {},
		total: {},
		activeHtml: {},
		components: {},
		progressPercent: {},
		blackout: { type: Boolean },
		exitBlackout: { type: Function },
		designWidth: {},
		designHeight: {},
		config: {},
		slides: {}
	},
	setup(e) {
		let t = e, r = f("stepIndex"), l = w(null), u = w(null), { transformStyle: d } = Ht(l, t.designWidth, t.designHeight), { transformStyle: p } = Ht(u, t.designWidth, t.designHeight), m = w(280), h = !1;
		function g(e) {
			h = !0, document.addEventListener("mousemove", b), document.addEventListener("mouseup", S), e.preventDefault();
		}
		function b(e) {
			if (!h) return;
			let t = window.innerWidth - e.clientX;
			m.value = Math.max(160, Math.min(600, t));
		}
		function S() {
			h = !1, document.removeEventListener("mousemove", b), document.removeEventListener("mouseup", S);
		}
		let C = n(() => ({ gridTemplateColumns: `1fr 6px ${m.value}px` })), T = w(260), E = !1;
		function D(e) {
			E = !0, document.addEventListener("mousemove", O), document.addEventListener("mouseup", j), e.preventDefault();
		}
		function O(e) {
			if (!E) return;
			let t = window.innerHeight - e.clientY;
			T.value = Math.max(120, Math.min(600, t));
		}
		function j() {
			E = !1, document.removeEventListener("mousemove", O), document.removeEventListener("mouseup", j);
		}
		let M = n(() => {
			let e = t.current;
			return e?.notes ? e.notes : "No notes";
		}), N = n(() => t.currentIndex >= t.total - 1 ? null : t.slides[t.currentIndex + 1] ?? null), ee = n(() => N.value ? Y(N.value.html).html : ""), te = n(() => N.value ? Y(N.value.html).steps : 0);
		function F() {
			try {
				let e = localStorage.getItem($t);
				return e ? JSON.parse(e) : Date.now();
			} catch {
				return Date.now();
			}
		}
		function I() {
			try {
				localStorage.setItem($t, JSON.stringify(z.value));
			} catch {}
		}
		function ne() {
			try {
				let e = localStorage.getItem(en);
				return e ? JSON.parse(e) : [];
			} catch {
				return [];
			}
		}
		function L() {
			try {
				localStorage.setItem(en, JSON.stringify(R.value));
			} catch {}
		}
		let R = w(ne()), z = w(F()), B = w(Date.now()), re = null, ie = n(() => {
			let e = Math.floor((B.value - z.value) / 1e3), t = Math.floor(e / 60), n = e % 60;
			return `${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
		}), ae = n(() => {
			let e = R.value.length;
			return e ? `${e} entries logged` : "";
		});
		function oe(e) {
			let n = t.slides[e];
			if (!n) return;
			let r;
			if (n.html) {
				let e = document.createElement("div");
				e.innerHTML = n.html, r = e.querySelector("h1,h2,h3")?.textContent?.trim() || void 0;
			}
			let i = Math.floor((Date.now() - z.value) / 1e3);
			R.value.push({
				slide: e + 1,
				elapsed: i,
				heading: r
			}), L();
		}
		function V(e, t) {
			let n = Math.floor((Date.now() - z.value) / 1e3);
			R.value.push({
				slide: e + 1,
				elapsed: n,
				step: t + 1
			}), L();
		}
		function se() {
			confirm("Reset timer and clear slide log?") && (z.value = Date.now(), B.value = Date.now(), R.value = [], I(), L(), W("Reset"));
		}
		function H() {
			let e = new Date(z.value).toLocaleString(), t = ["slide,elapsed_sec,heading"];
			t.push(`0,0,"Started: ${e}"`);
			for (let e of R.value) {
				let n = e.heading ? `"${e.heading.replace(/"/g, "\"\"")}"` : "", r = e.step === void 0 ? String(e.slide) : `${e.slide}.${String(e.step).padStart(2, "0")}`;
				t.push(`${r},${e.elapsed},${n}`);
			}
			let n = t.join("\n");
			navigator.clipboard.writeText(n).catch(() => {});
			let r = new Blob([n], { type: "text/csv;charset=utf-8;" }), i = URL.createObjectURL(r), a = document.createElement("a");
			a.href = i, a.download = `slides-log-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, a.click(), URL.revokeObjectURL(i), W("Copied + Downloaded");
		}
		let U = w(""), ce = null;
		function W(e) {
			U.value = e, ce && clearTimeout(ce), ce = setTimeout(() => {
				U.value = "";
			}, 1500);
		}
		return P(() => [r.value, t.currentIndex], ([e, n], [r, i]) => {
			e === r ? t.config.logSteps && n !== i && V(e, n) : oe(e);
		}), v(() => {
			z.value = F(), I(), B.value = Date.now(), re = setInterval(() => {
				B.value = Date.now();
			}, 1e3), oe(t.currentIndex);
		}), y(() => {
			re && clearInterval(re), S(), j();
		}), (t, n) => (x(), o("div", {
			class: "sp-presenter-layout",
			style: _(C.value)
		}, [
			s("div", Ut, [
				s("div", {
					class: "sp-presenter-preview",
					ref_key: "previewContainerEl",
					ref: l
				}, [s("div", {
					style: _(A(d)),
					class: "sp-slide-scaler"
				}, [e.current ? (x(), i(bt, {
					key: e.currentIndex,
					slide: e.current,
					html: e.activeHtml,
					components: e.components
				}, null, 8, [
					"slide",
					"html",
					"components"
				])) : a("", !0)], 4)], 512),
				s("div", {
					class: "sp-presenter-vdivider",
					onMousedown: D
				}, null, 32),
				s("div", {
					class: "sp-presenter-next",
					style: _({ height: T.value + "px" })
				}, [n[1] ||= s("div", { class: "sp-presenter-next-label" }, "Next", -1), s("div", {
					class: "sp-presenter-next-slide-wrap",
					ref_key: "nextContainerEl",
					ref: u
				}, [s("div", {
					style: _(A(p)),
					class: "sp-slide-scaler"
				}, [N.value ? (x(), i(bt, {
					key: "next-" + (e.currentIndex + 1),
					slide: N.value,
					html: ee.value,
					fixedStep: te.value - 1,
					components: e.components
				}, null, 8, [
					"slide",
					"html",
					"fixedStep",
					"components"
				])) : a("", !0)], 4)], 512)], 4)
			]),
			s("div", {
				class: "sp-presenter-divider",
				onMousedown: g
			}, null, 32),
			s("div", Wt, [s("div", Gt, [
				s("div", Kt, [c(k(e.currentIndex + 1) + " ", 1), s("small", null, "/ " + k(e.total), 1)]),
				s("div", qt, [s("div", {
					class: "sp-presenter-progress-bar",
					style: _({ width: e.progressPercent + "%" })
				}, null, 4)]),
				s("div", {
					class: "sp-presenter-clock",
					title: ae.value
				}, [
					s("span", Yt, k(ie.value), 1),
					U.value ? (x(), o("span", Xt, k(U.value), 1)) : a("", !0),
					s("span", { class: "sp-presenter-clock-actions" }, [s("button", {
						class: "sp-presenter-clock-btn",
						title: "Export log (CSV)",
						onClick: H
					}, "⬇"), s("button", {
						class: "sp-presenter-clock-btn",
						title: "Reset timer",
						onClick: se
					}, "↺")])
				], 8, Jt),
				e.blackout ? (x(), o("div", {
					key: 0,
					class: "sp-presenter-blackout-badge",
					onClick: n[0] ||= (...t) => e.exitBlackout && e.exitBlackout(...t)
				}, "BLACKED OUT")) : a("", !0)
			]), s("div", Zt, [n[2] ||= s("h3", null, "Speaker Notes", -1), s("div", {
				class: "sp-presenter-notes-content",
				innerHTML: M.value
			}, null, 8, Qt)])])
		], 4));
	}
}), nn = { class: "sp-overview-grid" }, rn = ["onClick"], an = { class: "sp-overview-thumb-stage" }, on = { class: "sp-overview-thumb-num" }, sn = /* @__PURE__ */ d({
	__name: "SpOverview",
	props: {
		slides: {},
		currentIndex: {},
		slideHeadingLevels: {},
		overviewHtmls: {},
		overviewThumbStyle: {},
		overviewSlideStyle: {},
		components: {}
	},
	emits: ["close", "select"],
	setup(t) {
		return (n, r) => (x(), o("div", {
			class: "sp-overview",
			onClick: r[0] ||= I((e) => n.$emit("close"), ["self"])
		}, [s("div", nn, [(x(!0), o(e, null, T(t.slides, (e, r) => (x(), o("div", {
			key: r,
			class: h(["sp-overview-thumb", {
				active: r === t.currentIndex,
				"sp-overview-h1": t.slideHeadingLevels[r] === 1,
				"sp-overview-h2": t.slideHeadingLevels[r] === 2,
				"sp-overview-h3": t.slideHeadingLevels[r] === 3
			}]),
			style: _(t.overviewThumbStyle),
			onClick: (e) => n.$emit("select", r)
		}, [s("div", an, [s("div", { style: _(t.overviewSlideStyle) }, [l(bt, {
			slide: e,
			html: t.overviewHtmls[r],
			fixedStep: A(Y)(e.html).steps - 1,
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"fixedStep",
			"components"
		])], 4)]), s("div", on, k(r + 1), 1)], 14, rn))), 128))])]));
	}
}), cn = { class: "sp-go-prompt-box" }, ln = ["onKeydown"], un = {
	key: 0,
	class: "sp-go-results"
}, dn = ["onClick", "onMouseenter"], fn = { class: "sp-go-result-thumb" }, pn = { class: "sp-go-result-text" }, mn = { class: "sp-go-result-num" }, hn = ["innerHTML"], gn = {
	key: 1,
	class: "sp-go-no-results"
}, _n = /* @__PURE__ */ d({
	__name: "SpGoPrompt",
	props: {
		slides: {},
		overviewHtmls: {},
		designWidth: {},
		designHeight: {},
		components: {},
		total: {}
	},
	emits: ["close", "select"],
	setup(t, { emit: r }) {
		let i = t, c = r, u = w(""), d = w(0), f = w(null), p = n(() => i.slides.map((e, t) => {
			let n = document.createElement("div");
			n.innerHTML = e.html;
			let r = [];
			return n.querySelectorAll("h1,h2,h3").forEach((e) => {
				let t = e.textContent?.trim();
				t && r.push(t);
			}), {
				index: t,
				texts: r
			};
		})), g = n(() => {
			let e = u.value.trim().toLowerCase();
			if (!e || /^\d+$/.test(e)) return [];
			let t = [];
			for (let n of p.value) {
				let r = [];
				for (let t of n.texts) t.toLowerCase().includes(e) && r.push(t);
				r.length && t.push({
					index: n.index,
					matches: r
				});
			}
			return t;
		});
		P(g, () => {
			d.value = 0;
		});
		let y = n(() => ({
			transform: `scale(${210 / i.designWidth})`,
			transformOrigin: "top left",
			width: i.designWidth + "px",
			height: i.designHeight + "px"
		}));
		function b(e) {
			let t = u.value.trim();
			if (!t) return S(e);
			let n = e.toLowerCase(), r = t.toLowerCase(), i = [], a = 0;
			for (; a < e.length;) {
				let o = n.indexOf(r, a);
				if (o === -1) {
					i.push(S(e.slice(a)));
					break;
				}
				i.push(S(e.slice(a, o))), i.push("<mark>" + S(e.slice(o, o + t.length)) + "</mark>"), a = o + t.length;
			}
			return i.join("");
		}
		function S(e) {
			return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
		function C() {
			d.value < g.value.length - 1 && d.value++;
		}
		function E() {
			d.value > 0 && d.value--;
		}
		function D() {
			let e = u.value.trim();
			if (e) {
				if (/^\d+$/.test(e)) {
					let t = parseInt(e, 10);
					t >= 1 && t <= i.total && c("select", t - 1);
					return;
				}
				if (g.value.length > 0) {
					let e = g.value[d.value]?.index ?? g.value[0].index;
					c("select", e);
				}
			}
		}
		function O(e) {
			c("select", e);
		}
		return v(() => {
			m(() => f.value?.focus());
		}), (n, r) => (x(), o("div", {
			class: "sp-go-prompt",
			onClick: r[2] ||= I((e) => n.$emit("close"), ["self"])
		}, [s("div", cn, [te(s("input", {
			ref_key: "goPromptInput",
			ref: f,
			"onUpdate:modelValue": r[0] ||= (e) => u.value = e,
			class: "sp-go-prompt-input",
			placeholder: "slide number or search text…",
			onKeydown: [
				F(D, ["enter"]),
				r[1] ||= F((e) => n.$emit("close"), ["escape"]),
				F(I(C, ["prevent"]), ["down"]),
				F(I(E, ["prevent"]), ["up"])
			]
		}, null, 40, ln), [[M, u.value]]), g.value.length ? (x(), o("div", un, [(x(!0), o(e, null, T(g.value, (n, r) => (x(), o("div", {
			key: n.index,
			class: h(["sp-go-result", { focused: r === d.value }]),
			onClick: (e) => O(n.index),
			onMouseenter: (e) => d.value = r
		}, [s("div", fn, [s("div", { style: _(y.value) }, [l(bt, {
			slide: t.slides[n.index],
			html: t.overviewHtmls[n.index],
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"components"
		])], 4)]), s("div", pn, [s("div", mn, "Slide " + k(n.index + 1), 1), (x(!0), o(e, null, T(n.matches, (e, t) => (x(), o("div", {
			key: t,
			class: "sp-go-result-heading",
			innerHTML: b(e)
		}, null, 8, hn))), 128))])], 42, dn))), 128))])) : u.value && !/^\d*$/.test(u.value) ? (x(), o("div", gn, " No slides match \"" + k(u.value) + "\" ", 1)) : a("", !0)])]));
	}
});
//#endregion
//#region src/export.ts
async function vn() {
	let e = document.getElementById("sp-content");
	if (!e) throw Error("Export failed: #sp-content not found");
	let t = e.textContent?.trim() || "";
	t = ye(t);
	let n = document.createElement("div");
	n.innerHTML = t, n.querySelectorAll("img[src]").forEach((e) => {
		let t = e.getAttribute("src");
		if (!t || t.startsWith("data:") || t.startsWith("blob:")) return;
		let n = document.createElement("sp-img");
		n.setAttribute("src", t), e.replaceWith(n);
	}), t = n.innerHTML;
	let r = [], i = document.querySelectorAll("link[rel=\"stylesheet\"]");
	for (let e of i) {
		let t = e.getAttribute("href");
		if (t && !t.includes("slides-purryst")) try {
			let e = await fetch(new URL(t, window.location.href).href);
			e.ok && r.push(await e.text());
		} catch {}
	}
	let a = `<template id="sp-cache">${Re().replace(/</g, "&lt;")}</template>`, o = {};
	for (let [e, t] of Object.entries(se)) t != null && (o[e] = t);
	let s = JSON.stringify(o, null, 2).replace(/"([^"]+)":/g, "$1:"), c = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Presentation</title>
${r.length ? `<style>\n${r.join("\n")}\n</style>` : ""}
</head>
<body>
<div id="app"></div>
<script type="text/html" id="sp-content">
${t}
<\/script>
${a}
<script src="./slides-purryst.bundle.js"><\/script>
<script>
(async () => { await SlidesPurryst.createSlidesPurryst(${s}) })()
<\/script>
</body>
</html>`, l = new Blob([c], { type: "text/html" }), u = URL.createObjectURL(l), d = document.createElement("a");
	d.href = u, d.download = "presentation-standalone.html", document.body.appendChild(d), d.click(), document.body.removeChild(d), URL.revokeObjectURL(u);
}
//#endregion
//#region src/composables/useCodeHighlight.ts
var yn = null, bn = null;
async function xn() {
	if (!yn) return bn || (bn = (async () => {
		try {
			let { createHighlighter: e } = await import("shiki");
			yn = await e({
				langs: [
					"ts",
					"js",
					"tsx",
					"jsx",
					"html",
					"css",
					"json",
					"bash",
					"sh",
					"python",
					"rust",
					"go",
					"vue"
				],
				themes: ["dark-plus", "material-theme"]
			});
		} catch {
			yn = null;
		}
	})(), bn);
}
function Sn(e) {
	for (let t of e.classList) {
		if (t.startsWith("language-")) return t.slice(9);
		if (t.startsWith("lang-")) return t.slice(5);
	}
	let t = e.closest("[class*=\"language-\"]");
	if (t) {
		for (let e of t.classList) if (e.startsWith("language-")) return e.slice(9);
	}
	return null;
}
async function Cn(e) {
	if (await xn(), !yn) return e;
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.querySelectorAll("pre");
	for (let e of n) {
		let t = e.querySelector("code");
		if (!t) continue;
		let n = Sn(t);
		if (!n) continue;
		let r = t.textContent || "";
		try {
			e.outerHTML = yn.codeToHtml(r, {
				lang: n,
				theme: "dark-plus"
			});
		} catch {}
	}
	return t.innerHTML;
}
//#endregion
//#region src/composables/useChunklets.ts
function wn(e) {
	let t = [];
	return e.querySelectorAll("sp-chunk").forEach((e) => {
		let n = e.getAttribute("name");
		if (!n) return;
		let r = (e.getAttribute("params") || "").split(",").map((e) => e.trim()).filter(Boolean), i = e.innerHTML.replace(/^\s*\n/m, "").replace(/\n\s*$/m, "");
		i && t.push({
			name: n,
			params: r,
			html: i
		});
	}), t;
}
function Tn(e, t) {
	return e.replace(/\$(\w+)/g, (e, n) => n in t ? String(t[n]) : `$${n}`);
}
function En(e) {
	if (e.params.length === 0) return "instant";
	let t = e.params.includes("w"), n = e.params.includes("h");
	return t || n ? "drag" : "click";
}
function Dn() {
	let e = document.querySelector(".sp-scale-wrap");
	if (!e) return 1;
	let t = window.getComputedStyle(e).transform;
	if (!t || t === "none") return 1;
	let n = t.match(/matrix\(([^)]+)\)/);
	if (n) return parseFloat(n[1].split(", ")[0]) || 1;
	let r = t.match(/matrix3d\(([^)]+)\)/);
	return r && parseFloat(r[1].split(", ")[0]) || 1;
}
//#endregion
//#region src/components/SpPresentation.vue?vue&type=script&setup=true&lang.ts
var On = ["data-source-file-push"], kn = { class: "sp-global-error" }, An = {
	key: 0,
	class: "sp-loading"
}, jn = { class: "sp-global-top" }, Mn = { class: "sp-global-bottom" }, Nn = { class: "sp-slide-footer" }, Pn = { class: "sp-chunklet-hint" }, Fn = { class: "sp-nav-bar" }, In = ["title"], Ln = ["disabled"], Rn = ["disabled"], zn = {
	key: 0,
	class: "sp-nav-more-menu"
}, Bn = { class: "sp-nav-more-icon" }, Vn = { class: "sp-nav-more-item sp-nav-more-browse" }, Hn = { class: "sp-nav-pills" }, Un = {
	key: 0,
	class: "sp-nav-pill-ellipsis"
}, Wn = ["onClick", "aria-label"], Gn = {
	key: 1,
	class: "sp-chunk-bar"
}, Kn = ["onClick"], qn = { class: "sp-chunk-bar-badge" }, Jn = { class: "sp-progress" }, Yn = /* @__PURE__ */ d({
	__name: "SpPresentation",
	props: {
		slides: {},
		rawSlideSources: {},
		transition: { default: "none" },
		transitionDuration: { default: 200 },
		presenter: {
			type: Boolean,
			default: !1
		},
		designWidth: { default: 1920 },
		designHeight: { default: 1080 },
		author: { default: "" },
		components: { default: () => ({}) },
		seed: { default: 12345678 },
		raw: {}
	},
	setup(t, { expose: r }) {
		let u = t, { slides: f, currentIndex: p, current: g, total: C, goTo: j, nextSlide: M, prevSlide: F, setSlides: ne } = oe(u.slides), { stepIndex: L, totalSteps: R, isFirstStep: z, isLastStep: B, nextStep: re, prevStep: se } = Ee(), H = !1, U = null, ce = w(0), W = O(null), le = O(null);
		P(() => u.raw?.before, (e) => {
			if (!e) {
				W.value = null;
				return;
			}
			W.value = d({
				template: `<div style="display:contents" class="sp-raw-before">${e}</div>`,
				components: u.components
			});
		}, { immediate: !0 }), P(() => u.raw?.after, (e) => {
			if (!e) {
				le.value = null;
				return;
			}
			le.value = d({
				template: `<div style="display:contents" class="sp-raw-after">${e}</div>`,
				components: u.components
			});
		}, { immediate: !0 });
		let { openPresenterWindow: ue, closePresenter: de, presenterActive: fe, syncState: pe, syncBlackout: K, send: J, onMessage: he, channel: ge } = dt(), { transformStyle: _e, containerStyle: ve } = ft(u.designWidth, u.designHeight), xe = w(null), Se = w(null);
		S("stepIndex", L), S("slideIndex", p), S("contentVersion", ce), S("slides", f), S("goTo", j), S("sp-components", u.components);
		let Ce = w(u.rawSlideSources ?? f.value.map((e) => e.html));
		S("rawSlideSources", Ce);
		let we = w(1), Te = w(!1), X = n(() => window.location.pathname);
		P(p, (e, t) => {
			e !== t && (we.value = e > t ? 1 : -1, Te.value = !0);
		});
		let De = n(() => {
			let e = g.value?.transition ?? u.transition;
			return e === "" ? "none" : e;
		}), Oe = n(() => {
			let e = `sp-${De.value}`;
			return De.value === "none" ? e : `${e} sp-dir-${we.value === 1 ? "forward" : "backward"}`;
		}), ke = n(() => De.value === "none" ? 0 : g.value?.transitionDuration ?? u.transitionDuration), Ae = n(() => ({
			"--sp-design-width": `${u.designWidth}px`,
			"--sp-design-height": `${u.designHeight}px`,
			"--sp-transition-duration": `${ke.value}ms`
		}));
		b(() => {
			De.value === "none" || !Te.value || !Se.value || (Te.value = !1, Se.value.classList.add("sp-swapping"), Se.value.offsetHeight, Se.value.classList.remove("sp-swapping"));
		});
		let je = n(() => p.value === 0), Me = n(() => p.value === C.value - 1), Z = n(() => C.value === 0 ? 0 : (p.value + 1) / C.value * 100), Ne = n(() => {
			let e = Ie.value;
			if (e <= 23) return Array.from({ length: e }, (e, t) => ({
				type: "pill",
				index: t
			}));
			let t = [], n = p.value, r = Math.max(5, n - 5), i = Math.min(e - 1 - 5, n + 5);
			for (let e = 0; e < 5; e++) t.push({
				type: "pill",
				index: e
			});
			r > 5 && t.push({
				type: "ellipsis",
				id: "pre"
			});
			for (let e = r; e <= i; e++) t.push({
				type: "pill",
				index: e
			});
			i < e - 1 - 5 && t.push({
				type: "ellipsis",
				id: "post"
			});
			for (let n = e - 5; n < e; n++) t.push({
				type: "pill",
				index: n
			});
			return t;
		}), Pe = n(() => {
			let e = f.value.map((e, t) => e.fakeEnd ? t : -1).filter((e) => e >= 0), t = C.value - 1;
			return t >= 0 && !e.includes(t) && e.push(t), e.sort((e, t) => e - t);
		}), Fe = n(() => Pe.value.find((e) => e >= p.value) ?? C.value - 1), Ie = n(() => Fe.value + 1), Le = n(() => {
			let e = g.value;
			return e ? Y(e.html).html : "";
		});
		function Re() {
			B.value ? p.value < C.value - 1 && M() : re();
		}
		function ze() {
			z.value ? p.value > 0 && F() : se();
		}
		let Be = n(() => p.value === 0 ? null : f.value[p.value - 1] ?? null), Ve = n(() => Be.value ? Y(Be.value.html).html : ""), He = n(() => Be.value ? Y(Be.value.html).steps : 0), Ue = n(() => p.value >= C.value - 1 ? null : f.value[p.value + 1] ?? null), We = n(() => Ue.value ? Y(Ue.value.html).html : "");
		function Ge() {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}
		function Ke() {
			fe.value ? de() : ue();
		}
		let Q = _t();
		V.config = Q;
		let Je = w(!1), Ye = w(!1), $ = w(!1), Xe = w(!0), Ze = w(!1), Qe = w(null);
		function $e(e) {
			let t = document.documentElement;
			e === "auto" ? t.removeAttribute("data-dark-mode") : t.dataset.darkMode = e;
		}
		function et() {
			Q.darkMode = Q.darkMode === "dark" ? "light" : "dark";
		}
		let tt = n(() => Q.darkMode === "dark" ? "Dark" : "Light"), nt = n(() => Q.darkMode === "dark" ? "●" : "○");
		P(() => Q.darkMode, $e, { immediate: !0 }), ee(() => {
			V.navLocked = Q.navLocked, V.currentIndex = p.value, V.stepIndex = L.value, V.total = C.value, V.effectiveLast = Fe.value, V.effectiveTotal = Ie.value, V.fakeEndIndices = Pe.value;
		}), V.toggleNavLock = () => {
			Q.navLocked = !Q.navLocked;
		}, V.goTo = j, V.next = Re, V.prev = ze, V.nextSlide = M, V.prevSlide = F, V.export = vn;
		let rt = n(() => ({
			width: u.designWidth * Q.overviewScale + "px",
			height: u.designHeight * Q.overviewScale + "px"
		})), it = n(() => ({
			transform: `scale(${Q.overviewScale})`,
			transformOrigin: "top left",
			width: u.designWidth + "px",
			height: u.designHeight + "px"
		})), at = n(() => f.value.map((e) => Y(e.html).html)), ot = n(() => f.value.map((e) => {
			let t = document.createElement("div");
			t.innerHTML = e.html;
			let n = t.querySelector("h1,h2,h3");
			return n ? parseInt(n.tagName[1]) : 0;
		}));
		function st(e) {
			Je.value = !1, U = 0, j(e);
		}
		let ct = w(!1);
		function lt() {
			ct.value = !0;
		}
		function pt() {
			ct.value = !1;
		}
		function mt(e) {
			pt(), j(e);
		}
		P(g, (e, t) => {
			R.value = Y(e.html).steps, t?.num !== e?.num && (U === null ? H ? (L.value = Math.min(Math.max(L.value, 0), Math.max(0, R.value - 1)), H = !1) : we.value === -1 ? L.value = Math.max(0, R.value - 1) : L.value = 0 : (L.value = Math.min(Math.max(U, 0), Math.max(0, R.value - 1)), U = null));
		});
		let ht = w(!1);
		P([p, L], () => {
			ht.value || pe(p.value, L.value);
		}, { flush: "post" }), P([p, L], () => {
			u.presenter || gt();
		}, { flush: "post" });
		function gt() {
			let e = `#${p.value}/${L.value}`;
			history.replaceState(null, "", e);
		}
		function vt() {
			let e = location.hash.match(/^#(\d+)(?:\/(\d+))?$/);
			if (!e) return;
			let t = parseInt(e[1], 10), n = e[2] === void 0 ? 0 : parseInt(e[2], 10);
			t >= 0 && t < C.value && (t !== p.value && (H = !0), j(t), L.value = n);
		}
		function yt() {
			vt();
		}
		he("sync", (e) => {
			ht.value = !0, e.slide !== p.value && (H = !0), j(e.slide), L.value = e.step, m(() => {
				ht.value = !1;
			});
		}), he("presenter-ready", () => {
			pe(p.value, L.value);
		}), he("presenter-close", () => {
			de();
		}), he("blackout", (e) => {
			$.value = e.active;
		}), u.presenter && (J("presenter-ready"), window.addEventListener("beforeunload", () => {
			J("presenter-close");
		}));
		function xt() {
			$.value = !$.value, K($.value);
		}
		function St() {
			$.value && ($.value = !1, K(!1));
		}
		let Ct = [...G._keymapSetups];
		G.applyAnimRegistrations();
		let { rebuildKeymap: wt } = ut({
			next: Re,
			prev: ze,
			goTo: j,
			goToPrevBegin: Dt,
			goToNextBegin: kt,
			goToPrevEnd: Ot,
			goToNextEnd: At,
			currentIndex: p,
			current: g,
			total: C,
			nextStep: re,
			prevStep: se,
			stepIndex: L,
			totalSteps: R,
			isLastStep: B,
			isFirstStep: z,
			onPresenterToggle: Ke,
			onOverviewToggle: () => Je.value = !Je.value,
			onOverviewExit: () => {
				Je.value = !1;
			},
			onGoPrompt: lt,
			onBlackoutToggle: xt,
			onBlackoutExit: St,
			onDevPaneToggle: () => {
				Q.proMode ? jt() : et();
			},
			onChunkBarToggle: Lt
		}, {
			getContext: () => ({
				overview: Je.value,
				presenter: fe.value,
				blackout: $.value,
				devPane: Ye.value,
				dragging: V.dragging,
				goPrompt: ct.value
			}),
			extraSetups: Ct
		});
		v(() => {
			g.value && (R.value = Y(g.value.html).steps), u.presenter ? Xe.value = !1 : (vt(), m(() => {
				gt(), Xe.value = !1;
			}), window.addEventListener("hashchange", yt)), document.addEventListener("click", Mt, !0), Tt(u.seed), Et();
		});
		function Tt(e) {
			if (document.head.querySelectorAll("link[rel=icon]").length == 0) {
				let [t, n, r, i, a] = [
					"🐯",
					-20,
					14,
					-.85,
					1
				], o = (180 + (e - 12345678)) % 360, s = document.createElement("link");
				s.setAttribute("rel", "icon"), s.setAttribute("type", "image/svg+xml"), s.setAttribute("href", `data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20style='filter:hue-rotate(${o}deg)'%20viewBox='0%200%2016%2016'%3E%3Ctext%20transform='scale(${i},${a})'%20x='${n}'%20y='${r}'%3E${t}%3C/text%3E%3C/svg%3E`), document.head.append(s);
			}
		}
		async function Et() {
			for (let e = 0; e < f.value.length; e++) {
				let t = f.value[e], n = await Cn(t.html);
				n !== t.html && (f.value[e] = {
					...t,
					html: n
				});
			}
		}
		y(() => {
			document.removeEventListener("click", Mt, !0), window.removeEventListener("hashchange", yt), window.removeEventListener("keydown", Jt);
		});
		function Dt() {
			L.value > 0 ? L.value = 0 : p.value > 0 && (U = 0, j(p.value - 1));
		}
		function Ot() {
			p.value > 0 && j(p.value - 1);
		}
		function kt() {
			p.value < C.value - 1 && (U = 0, j(p.value + 1));
		}
		function At() {
			L.value < R.value - 1 ? L.value = Y(f.value[p.value].html).steps - 1 : p.value < C.value - 1 && (U = Math.max(0, Y(f.value[p.value + 1].html).steps - 1), j(p.value + 1));
		}
		function jt() {
			Ye.value = !Ye.value;
		}
		function Mt(e) {
			Ze.value && Qe.value && !Qe.value.contains(e.target) && (Ze.value = !1);
		}
		let Nt = n(() => {
			let e = V.selectedChunklet;
			return e ? En(e) : "click";
		});
		function Pt(e) {
			let t = e.currentTarget;
			if (!t) return {
				x: 0,
				y: 0
			};
			let n = t.getBoundingClientRect(), r = Dn();
			return {
				x: Math.round((e.clientX - n.left) / r),
				y: Math.round((e.clientY - n.top) / r)
			};
		}
		function Ft(e, t) {
			if (!e) return;
			let n = Tn(e.html, t), r = p.value, i = f.value[r], a = i.html;
			f.value = f.value.map((e, t) => t === r ? {
				...e,
				html: a + "\n" + n
			} : e), Ce.value[r] && (Ce.value = Ce.value.map((e, t) => t === r ? e + "\n" + n : e)), R.value = Y(g.value.html).steps, ce.value++, V.chunkletMode = !1, V.selectedChunklet = null, Rt(n, i.editableIndex);
		}
		function It(e) {
			if (V.selectedChunklet === e && V.chunkletMode) {
				qt();
				return;
			}
			V.selectedChunklet = e, V.chunkletMode = !0;
		}
		function Lt() {
			V.showChunkBar = !V.showChunkBar;
		}
		function Rt(e, t) {
			let n = Se.value?.querySelector(".sp-slide-current"), r = Se.value?.querySelector(".sp-slide-current [data-source-file-push] + *") ?? n, i = n ? qe(r) : null;
			fetch("/__sp_edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "insert-chunk",
					html: e,
					file: i,
					editableIndex: t
				})
			}).catch(() => {});
		}
		let zt = w({
			x: 0,
			y: 0
		}), Bt = w({
			x: 0,
			y: 0
		}), Ht = w(!1), Ut = n(() => {
			let e = Math.min(zt.value.x, Bt.value.x), t = Math.min(zt.value.y, Bt.value.y), n = Math.abs(Bt.value.x - zt.value.x), r = Math.abs(Bt.value.y - zt.value.y);
			return {
				left: e + "px",
				top: t + "px",
				width: n + "px",
				height: r + "px"
			};
		});
		function Wt(e) {
			e.preventDefault(), zt.value = Pt(e), Bt.value = { ...zt.value }, Ht.value = !0;
		}
		function Gt(e) {
			Ht.value && (Bt.value = Pt(e));
		}
		function Kt(e) {
			if (!Ht.value) return;
			Ht.value = !1;
			let t = V.selectedChunklet;
			if (!t) return;
			let n = En(t), r = zt.value, i = Bt.value, a = Math.abs(i.x - r.x), o = Math.abs(i.y - r.y);
			n === "drag" && !(a < 5 && o < 5) ? Ft(t, {
				x: Math.min(r.x, i.x),
				y: Math.min(r.y, i.y),
				w: Math.abs(i.x - r.x),
				h: Math.abs(i.y - r.y)
			}) : Ft(t, {
				x: r.x,
				y: r.y
			});
		}
		function qt() {
			V.chunkletMode = !1, V.selectedChunklet = null, Ht.value = !1;
		}
		P(() => V.chunkletMode, (e) => {
			e ? window.addEventListener("keydown", Jt) : window.removeEventListener("keydown", Jt);
		});
		function Jt(e) {
			e.key === "Escape" && qt();
		}
		function Yt(e) {
			Ce.value = ae(e);
			let t = be(ye(e)), n = document.createElement("div");
			n.innerHTML = t;
			let r = ie(n);
			if (r.length === 0) return;
			let i = p.value, a = L.value, o = Math.min(i, r.length - 1);
			H = !0, ne(r), p.value = o, R.value = Y(g.value.html).steps, o === i ? (L.value = Math.min(a, R.value - 1), H = !1) : L.value = 0, Et().then(() => {
				ce.value++;
			});
		}
		return r({ updateSlides: Yt }), (n, r) => (x(), o("div", {
			class: h(["sp-presentation", { "sp-presenter-mode": t.presenter }]),
			style: _(Ae.value)
		}, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": X.value
			}, null, 8, On),
			u.raw?.before ? (x(), i(D(W.value), { key: 0 })) : a("", !0),
			A(q).length > 0 ? (x(), o("div", {
				key: 1,
				class: "sp-global-error-overlay",
				onClick: r[0] ||= I((e) => A(me)(), ["self"])
			}, [s("div", kn, [r[13] ||= s("h3", null, "Global Errors", -1), s("ul", null, [(x(!0), o(e, null, T(A(q), (e, t) => (x(), o("li", { key: t }, k(e), 1))), 128))])])])) : a("", !0),
			t.presenter ? (x(), i(tn, {
				key: 3,
				current: A(g),
				currentIndex: A(p),
				total: A(C),
				activeHtml: Le.value,
				components: u.components,
				progressPercent: Z.value,
				blackout: $.value,
				exitBlackout: St,
				designWidth: u.designWidth,
				designHeight: u.designHeight,
				config: A(Q),
				slides: A(f)
			}, null, 8, [
				"current",
				"currentIndex",
				"total",
				"activeHtml",
				"components",
				"progressPercent",
				"blackout",
				"designWidth",
				"designHeight",
				"config",
				"slides"
			])) : (x(), o(e, { key: 2 }, [
				Xe.value ? (x(), o("div", An, [...r[14] ||= [s("div", { class: "sp-loading-text" }, "Loading…", -1)]])) : a("", !0),
				te(s("div", {
					class: "sp-viewport",
					style: _(A(ve)),
					ref_key: "viewportEl",
					ref: xe
				}, [s("div", {
					class: "sp-scale-wrap",
					style: _(A(_e))
				}, [
					s("div", jn, [E(n.$slots, "global-top")]),
					s("div", {
						class: h(Oe.value),
						ref_key: "transitionWrapEl",
						ref: Se
					}, [
						Be.value ? (x(), i(bt, {
							class: "sp-slide-prev",
							key: A(p) - 1,
							slide: Be.value,
							html: Ve.value,
							fixedStep: He.value - 1,
							components: u.components
						}, null, 8, [
							"slide",
							"html",
							"fixedStep",
							"components"
						])) : a("", !0),
						A(g) ? (x(), i(bt, {
							class: "sp-slide-current",
							key: A(p),
							slide: A(g),
							html: Le.value,
							components: u.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0),
						Ue.value ? (x(), i(bt, {
							class: "sp-slide-next",
							key: A(p) + 1,
							slide: Ue.value,
							html: We.value,
							fixedStep: 0,
							components: u.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0)
					], 2),
					s("div", Mn, [E(n.$slots, "global-bottom", {}, () => [s("footer", Nn, [s("span", null, k(A(p) + 1) + " / " + k(Ie.value), 1), s("span", null, k(t.author), 1)])])]),
					A(V).chunkletMode ? (x(), o("div", {
						key: 0,
						class: h(["sp-chunklet-overlay", { "sp-chunklet-drag": Nt.value === "drag" }]),
						onPointerdown: Wt,
						onPointermove: Gt,
						onPointerup: Kt
					}, [s("div", Pn, [c(k(Nt.value === "drag" ? "Click + drag to draw " + A(V).selectedChunklet?.name : Nt.value === "click" ? "Click to place " + A(V).selectedChunklet?.name : "Click to insert " + A(V).selectedChunklet?.name) + " ", 1), r[15] ||= s("span", { class: "sp-chunklet-hint-esc" }, "ESC to cancel", -1)]), Ht.value ? (x(), o("div", {
						key: 0,
						class: "sp-chunklet-preview",
						style: _(Ut.value)
					}, null, 4)) : a("", !0)], 34)) : a("", !0)
				], 4)], 4), [[N, !Xe.value]]),
				s("nav", { class: h(["sp-nav", { locked: A(Q).navLocked }]) }, [s("div", Fn, [
					s("button", {
						class: h(["sp-nav-btn sp-nav-lock", { locked: A(Q).navLocked }]),
						title: A(Q).navLocked ? "Unlock nav" : "Lock nav visible",
						onClick: r[1] ||= (e) => A(Q).navLocked = !A(Q).navLocked
					}, [...r[16] ||= [s("svg", {
						width: "14",
						height: "14",
						viewBox: "0 0 14 14",
						fill: "none"
					}, [s("rect", {
						x: "3",
						y: "5",
						width: "8",
						height: "7",
						rx: "1",
						stroke: "currentColor",
						"stroke-width": "1.2",
						fill: "none"
					}), s("path", {
						d: "M4.5 5V3.5a2.5 2.5 0 0 1 5 0V5",
						stroke: "currentColor",
						"stroke-width": "1.2",
						fill: "none"
					})], -1)]], 10, In),
					s("button", {
						class: "sp-nav-btn",
						disabled: je.value && A(z),
						"aria-label": "Previous",
						onClick: ze
					}, [...r[17] ||= [s("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 20 20",
						fill: "none"
					}, [s("path", {
						d: "M12 4l-6 6 6 6",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round"
					})], -1)]], 8, Ln),
					s("span", {
						class: "sp-nav-counter",
						onClick: lt
					}, k(A(p) + 1) + " / " + k(Ie.value), 1),
					s("button", {
						class: "sp-nav-btn",
						disabled: Me.value && A(B),
						"aria-label": "Next",
						onClick: Re
					}, [...r[18] ||= [s("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 20 20",
						fill: "none"
					}, [s("path", {
						d: "M8 4l6 6-6 6",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round"
					})], -1)]], 8, Rn),
					s("button", {
						class: "sp-nav-btn sp-fullscreen-btn",
						"aria-label": "Toggle fullscreen",
						title: "Fullscreen (F)",
						onClick: Ge
					}, [...r[19] ||= [s("svg", {
						width: "16",
						height: "16",
						viewBox: "0 0 16 16",
						fill: "none"
					}, [s("path", {
						d: "M3 3h3M3 13h3M13 3h-3M13 13h-3",
						stroke: "currentColor",
						"stroke-width": "1.5",
						"stroke-linecap": "round"
					}), s("path", {
						d: "M3 6v4M13 6v4",
						stroke: "currentColor",
						"stroke-width": "1.5",
						"stroke-linecap": "round"
					})], -1)]]),
					s("button", {
						class: h(["sp-nav-btn", { active: A(fe) }]),
						"aria-label": "Toggle presenter",
						title: "Presenter (P)",
						onClick: Ke
					}, [...r[20] ||= [s("svg", {
						width: "16",
						height: "16",
						viewBox: "0 0 16 16",
						fill: "none"
					}, [
						s("rect", {
							x: "2",
							y: "3",
							width: "12",
							height: "10",
							rx: "1",
							stroke: "currentColor",
							"stroke-width": "1.3",
							fill: "none"
						}),
						s("rect", {
							x: "5",
							y: "6",
							width: "6",
							height: "4",
							rx: ".5",
							stroke: "currentColor",
							"stroke-width": "1",
							fill: "none"
						}),
						s("path", {
							d: "M6 13v1h4v-1",
							stroke: "currentColor",
							"stroke-width": "1.3",
							fill: "none"
						})
					], -1)]], 2),
					s("div", {
						class: "sp-nav-more",
						ref_key: "moreMenuEl",
						ref: Qe
					}, [s("button", {
						class: h(["sp-nav-btn sp-nav-more-btn", { active: Ze.value }]),
						"aria-label": "More options",
						title: "More…",
						onClick: r[2] ||= (e) => Ze.value = !Ze.value
					}, "⋯", 2), Ze.value ? (x(), o("div", zn, [
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[3] ||= (e) => {
								et(), Ze.value = !1;
							}
						}, [s("span", Bn, k(nt.value), 1), c(" " + k(tt.value), 1)]),
						r[27] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[4] ||= (e) => {
								jt(), Ze.value = !1;
							}
						}, [...r[21] ||= [s("span", { class: "sp-nav-more-icon" }, "◇", -1), c(" Dev tools ", -1)]]),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[5] ||= (e) => {
								Je.value = !Je.value, Ze.value = !1;
							}
						}, [...r[22] ||= [s("span", { class: "sp-nav-more-icon" }, "⊞", -1), c(" Overview ", -1)]]),
						s("button", {
							class: h(["sp-nav-more-item", { active: A(V).showChunkBar }]),
							onClick: r[6] ||= (e) => {
								Lt(), Ze.value = !1;
							}
						}, [...r[23] ||= [s("span", { class: "sp-nav-more-icon" }, "▤", -1), c(" Chunks ", -1)]], 2),
						r[28] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[7] ||= (e) => xt()
						}, [s("span", { class: h(["sp-nav-more-icon sp-nav-more-icon-blackout", { active: $.value }]) }, "●", 2), r[24] ||= c(" Blackout ", -1)]),
						s("div", Vn, [s("button", {
							class: "sp-nav-more-browse-btn",
							title: "End of previous slide (A)",
							onClick: r[8] ||= (e) => Ot()
						}, [...r[25] ||= [s("svg", {
							width: "16",
							height: "16",
							viewBox: "0 0 16 16",
							fill: "none"
						}, [s("path", {
							d: "M10 3L5 8l5 5",
							stroke: "currentColor",
							"stroke-width": "1.5",
							"stroke-linecap": "round"
						}), s("path", {
							d: "M4 3v10",
							stroke: "currentColor",
							"stroke-width": "1.5",
							"stroke-linecap": "round"
						})], -1)]]), s("button", {
							class: "sp-nav-more-browse-btn",
							title: "End of next slide (Z)",
							onClick: r[9] ||= (e) => At()
						}, [...r[26] ||= [s("svg", {
							width: "16",
							height: "16",
							viewBox: "0 0 16 16",
							fill: "none"
						}, [s("path", {
							d: "M6 13l5-5-5-5",
							stroke: "currentColor",
							"stroke-width": "1.5",
							"stroke-linecap": "round"
						}), s("path", {
							d: "M12 13V3",
							stroke: "currentColor",
							"stroke-width": "1.5",
							"stroke-linecap": "round"
						})], -1)]])])
					])) : a("", !0)], 512)
				]), s("div", Hn, [(x(!0), o(e, null, T(Ne.value, (t) => (x(), o(e, { key: t.type === "pill" ? "p" + t.index : t.id }, [t.type === "ellipsis" ? (x(), o("span", Un, "…")) : (x(), o("button", {
					key: 1,
					class: h(["sp-nav-pill", {
						active: t.index === A(p),
						"sp-nav-pill-h1": ot.value[t.index] === 1,
						"sp-nav-pill-h2": ot.value[t.index] === 2,
						"sp-nav-pill-h3": ot.value[t.index] === 3
					}]),
					onClick: (e) => {
						A(j)(t.index), L.value = 0;
					},
					"aria-label": "Go to slide " + (t.index + 1)
				}, null, 10, Wn))], 64))), 128))])], 2),
				A(V).showChunkBar && A(V).chunkletDefs.length ? (x(), o("div", Gn, [(x(!0), o(e, null, T(A(V).chunkletDefs, (e) => (x(), o("button", {
					key: e.name,
					class: h(["sp-chunk-bar-btn", { active: A(V).selectedChunklet === e }]),
					onClick: (t) => It(e)
				}, [c(k(e.name) + " ", 1), s("span", qn, k(A(En)(e)), 1)], 10, Kn))), 128))])) : a("", !0),
				s("div", Jn, [s("div", {
					class: "sp-progress-bar",
					style: _({ width: Z.value + "%" })
				}, null, 4)]),
				$.value ? (x(), o("div", {
					key: 2,
					class: "sp-main-blackout",
					onClick: r[10] ||= (e) => $.value = !1
				}, [...r[29] ||= [s("span", { class: "sp-main-blackout-hint" }, "click to dismiss", -1)]])) : a("", !0)
			], 64)),
			Je.value ? (x(), i(sn, {
				key: 4,
				slides: A(f),
				currentIndex: A(p),
				slideHeadingLevels: ot.value,
				overviewHtmls: at.value,
				overviewThumbStyle: rt.value,
				overviewSlideStyle: it.value,
				components: u.components,
				onClose: r[11] ||= (e) => Je.value = !1,
				onSelect: st
			}, null, 8, [
				"slides",
				"currentIndex",
				"slideHeadingLevels",
				"overviewHtmls",
				"overviewThumbStyle",
				"overviewSlideStyle",
				"components"
			])) : a("", !0),
			l(Vt, {
				visible: Ye.value,
				"export-fn": A(V).export,
				onClose: r[12] ||= (e) => Ye.value = !1
			}, null, 8, ["visible", "export-fn"]),
			ct.value ? (x(), i(_n, {
				key: 5,
				slides: A(f),
				overviewHtmls: at.value,
				designWidth: u.designWidth,
				designHeight: u.designHeight,
				components: u.components,
				total: A(C),
				onClose: pt,
				onSelect: mt
			}, null, 8, [
				"slides",
				"overviewHtmls",
				"designWidth",
				"designHeight",
				"components",
				"total"
			])) : a("", !0),
			u.raw?.after ? (x(), i(D(le.value), { key: 6 })) : a("", !0)
		], 6));
	}
}), Xn = /* @__PURE__ */ d({
	__name: "SpAlternatives",
	props: {
		at: { default: 0 },
		cycle: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let r = t, a = w(null), c = f("stepIndex") ?? { value: 0 }, l = j();
		function u() {
			let e = a.value?.closest(".sp-slide")?.querySelector("[data-fixed-step]")?.getAttribute("data-fixed-step");
			return e == null ? c.value : parseInt(e);
		}
		let d = n(() => (l.default?.() ?? []).filter((e) => typeof e.type == "string")), p = n(() => {
			if (d.value.length === 0) return -1;
			let e = u() - (typeof r.at == "string" ? parseInt(r.at, 10) : r.at);
			return e < 0 ? -1 : !r.cycle && e >= d.value.length ? d.value.length - 1 : e % d.value.length;
		});
		return (t, n) => (x(), o(e, null, [s("span", {
			ref_key: "ghostEl",
			ref: a,
			style: { display: "none" }
		}, null, 512), (x(!0), o(e, null, T(d.value, (e, t) => (x(), i(D(e), {
			key: t,
			class: h(t === p.value ? "sp-anim-shown" : "sp-anim-hidden sp-hidden-is-empty")
		}, null, 8, ["class"]))), 128))], 64));
	}
}), Zn = /* @__PURE__ */ d({
	__name: "SpAnim",
	props: {
		spec: {},
		at: { default: "+0" },
		noJump: {
			type: [Boolean, String],
			default: !1
		}
	},
	setup(e) {
		let t = e, r = f("stepIndex"), i = f("animInstances"), a = w(null);
		function s() {
			if (!a) return r.value;
			let e = m().querySelector("[data-fixed-step]")?.getAttribute("data-fixed-step");
			return e == null ? r.value : parseInt(e);
		}
		function c(e) {
			let t = e.match(/^(\d+(?:\.\d+)?)(ms|s)\s+(.+)$/);
			if (t) {
				let e = parseFloat(t[1]) * (t[2] === "s" ? 1e3 : 1), n = t[3], r = c(n);
				for (let t of r) t.delayedBy = e;
				return r;
			}
			let n = e.match(/^@(\w+)(?:\((.*)\))?$/);
			if (n) {
				let e = W(n[1]);
				if (e) return e.parse(n[2] ?? "");
			}
			return e.startsWith("-") ? [{
				type: "hide",
				selector: e.slice(1)
			}] : [{
				type: "show",
				selector: e
			}];
		}
		function l(e) {
			let t = [], n = e.split("^").map((e) => e.trim());
			for (let e of n) t.push(...c(e));
			return t;
		}
		let u = n(() => (t.spec || "").split("|"));
		function d() {
			let e = t.at || "+0";
			if (e.startsWith("+") || e.startsWith("-")) throw Error("Relative at offset not supported in SpAnim, absolute at should be produced by useSteps");
			return parseInt(e, 10);
		}
		let p = n(() => {
			if (!t.spec) return [];
			let e = [];
			for (let t of u.value) {
				let n = t.trim(), r = n.match(/^@(\w+)\((.+)\)$/);
				if (r) {
					let t = W(r[1]);
					if (t?.expand) {
						let n = t.expand(r[2], m());
						for (let t of n) e.push(t);
						continue;
					}
				}
				e.push(l(n));
			}
			return e;
		});
		function m() {
			let e = a.value;
			if (!e) throw "not yet";
			for (; !e.classList.contains("sp-slide");) if (e = e.parentElement, e === null) throw "should not happen: .sp-anim-ghost has no .sp-slide ancestor";
			return e;
		}
		let h = -1;
		function g(e, t = !1) {
			let n = d(), r = p.value[e - n - 1];
			if (!r) return;
			let i = m(), a = [...r].sort((e, t) => (e.delayedBy ?? 0) - (t.delayedBy ?? 0));
			for (let n of a) {
				let r = V._animActionTypes[n.type];
				if (r) if (n.delayedBy && !t) setTimeout(() => {
					try {
						r.apply(i, n);
					} catch (t) {
						console.error("(Caught) Error applying anim action:", t), J(`Error applying anim action at step ${e}: ${t}`);
					}
				}, n.delayedBy);
				else try {
					r.apply(i, n);
				} catch (t) {
					console.error("(Caught) Error applying anim action:", t), J(`Error applying anim action at step ${e}: ${t}`);
				}
			}
		}
		function _(e) {
			let t = d(), n = p.value[e - t - 1];
			if (!n) return;
			let r = m();
			for (let e of n) {
				let t = V._animActionTypes[e.type];
				t && t.reverse(r, e);
			}
		}
		function b(e, t) {
			if (e !== h) {
				if (e > h) for (let n = h + 1; n <= e; n++) g(n, t);
				else {
					for (let t = h; t > e; t--) _(t);
					for (let t = 1; t <= e; t++) g(t, !0);
				}
				h = e;
			}
		}
		function S(e = !0) {
			let t = m();
			for (let e of p.value) for (let n of e) try {
				V._animActionTypes[n.type]?.init?.(t, n);
			} catch (e) {
				console.error("(Caught) Error initializing anim action:", e), J(`Error initializing anim action: ${e}`);
			}
			let n = s();
			if (h = 0, e) for (let e = 1; e <= n; e++) g(e, !0);
			else for (let e = 1; e <= n; e++) g(e, !1);
			h = n;
		}
		return v(() => {
			let e = {
				syncToStep: b,
				refresh: S
			};
			i.add(e), S(), y(() => {
				i.delete(e);
			});
		}), (e, t) => (x(), o("span", {
			class: "sp-anim-ghost",
			ref_key: "animEl",
			ref: a
		}, null, 512));
	}
}), Qn = ["data-debug"], $n = {
	key: 0,
	class: "sp-drag-edit-overlay"
}, er = ["onMousedown", "onTouchstart"], tr = ["title"], nr = /*@__PURE__*/ d({
	__name: "SpDrag",
	props: {
		at: { default: "" },
		x: { default: 0 },
		y: { default: 0 },
		w: { default: "auto" },
		h: { default: "auto" },
		rotate: { default: 0 },
		editableIndex: { default: -1 }
	},
	setup(t) {
		let r = f("slideIndex", w(0)), i = t, c = n(() => {
			if (!i.at) return null;
			let e = i.at.split("|");
			return e.length < 5 ? null : {
				x: parseFloat(e[0]),
				y: parseFloat(e[1]),
				w: (/^\d+\.?\d*$/.test(e[2]), e[2]),
				h: (/^\d+\.?\d*$/.test(e[3]), e[3]),
				rotate: parseFloat(e[4])
			};
		}), l = w(null), u = w(!1), d = [
			"nw",
			"n",
			"ne",
			"e",
			"se",
			"s",
			"sw",
			"w"
		], p = w(0), m = w(0), g = w("auto"), b = w("auto"), S = w(0);
		function C(e) {
			if (typeof e == "number") return e;
			let t = parseFloat(e);
			return isNaN(t) ? 0 : t;
		}
		function D() {
			let e = document.querySelector(".sp-scale-wrap");
			if (!e) return 1;
			let t = window.getComputedStyle(e).transform;
			if (!t || t === "none") return 1;
			let n = t.match(/matrix\(([^)]+)\)/);
			if (n) return parseFloat(n[1].split(", ")[0]) || 1;
			let r = t.match(/matrix3d\(([^)]+)\)/);
			return r && parseFloat(r[1].split(", ")[0]) || 1;
		}
		function O(e) {
			let t = c.value;
			return t ? t[e] : i[e];
		}
		function k() {
			p.value = C(O("x")), m.value = C(O("y")), g.value = O("w"), b.value = O("h"), S.value = C(O("rotate"));
		}
		function A(e) {
			if (!u.value) return;
			let t = e.shiftKey ? 10 : 1;
			switch (e.key) {
				case "ArrowUp":
					e.preventDefault(), m.value -= t;
					break;
				case "ArrowDown":
					e.preventDefault(), m.value += t;
					break;
				case "ArrowLeft":
					e.preventDefault(), p.value -= t;
					break;
				case "ArrowRight":
					e.preventDefault(), p.value += t;
					break;
			}
		}
		function j() {
			k(), l.value && (g.value === "auto" && (g.value = l.value.offsetWidth || 200), b.value === "auto" && (b.value = l.value.offsetHeight || 100)), u.value = !0, V.dragging = !0, window.addEventListener("keydown", A);
		}
		function M() {
			u.value = !1, V.dragging = !1, window.removeEventListener("keydown", A);
		}
		function N() {
			let e = P(), t = P(!0);
			if (t === e) {
				M();
				return;
			}
			let n = !!i.at, a = l.value?.getAttribute("data-drag-id"), o = qe(l.value);
			fetch("/__sp_edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					oldAttrs: n ? t : "__sp_insert__",
					newAttrs: e,
					file: o,
					editableIndex: i.editableIndex,
					slide: r.value,
					dragId: a
				})
			}).then(async (t) => {
				let n = await t.json();
				(!t.ok || !n.ok) && (console.error("SP edit failed:", t.status, n), ee(e));
			}).catch((t) => {
				console.error("SP edit error:", t), ee(e);
			}).finally(() => M());
		}
		function P(e = !1) {
			return `at="${e ? O("x") : Math.round(p.value)}|${e ? O("y") : Math.round(m.value)}|${e ? O("w") : g.value}|${e ? O("h") : b.value}|${e ? O("rotate") : Math.round(S.value * 10) / 10}"`;
		}
		function ee(e) {
			navigator.clipboard?.writeText(e).catch(() => {}), alert(`Could not auto-save to source.\n\nCopy this attribute and replace the existing sp-drag at attribute manually:\n\n${e}`);
		}
		let te = n(() => `Save: x=${Math.round(p.value)} y=${Math.round(m.value)} w=${g.value} h=${b.value} rotate=${Math.round(S.value * 10) / 10}`);
		function F() {
			u.value ? N() : j();
		}
		let ne = (e) => typeof e == "number" || /^\d+(\.\d+)?$/.test(e) ? e + "px" : e, L = n(() => ({
			position: "absolute",
			left: ne(p.value),
			top: ne(m.value),
			width: ne(g.value),
			height: ne(b.value),
			transform: S.value ? `rotate(${S.value}deg)` : void 0
		})), R = !1, z = 0, B = 0, re = 0, ie = 0, ae = 0;
		function oe(e) {
			return "touches" in e ? {
				clientX: e.touches[0].clientX,
				clientY: e.touches[0].clientY
			} : {
				clientX: e.clientX,
				clientY: e.clientY
			};
		}
		let se = 0;
		function H(e) {
			if (u.value) {
				e.preventDefault(), ce(e);
				return;
			}
			let t = Date.now();
			if (t - se < 300) {
				e.preventDefault(), F(), se = 0;
				return;
			}
			se = t;
		}
		function U() {
			R && (R = !1, document.removeEventListener("mousemove", W), document.removeEventListener("mouseup", U), document.removeEventListener("touchmove", W), document.removeEventListener("touchend", U), setTimeout(() => ae--, 0));
		}
		function ce(e) {
			if (!u.value) return;
			we(), R = !0, ae++;
			let { clientX: t, clientY: n } = oe(e);
			z = t, B = n, re = p.value, ie = m.value, document.addEventListener("mousemove", W), document.addEventListener("mouseup", U), document.addEventListener("touchmove", W, { passive: !1 }), document.addEventListener("touchend", U);
		}
		function W(e) {
			if (!R) return;
			e.preventDefault();
			let t = D(), { clientX: n, clientY: r } = oe(e), i = (n - z) / t, a = (r - B) / t;
			p.value = re + i, m.value = ie + a;
		}
		let le = !1, ue = "", de = 0, fe = 0, pe = 0, G = 0, K = 0, q = 0;
		function J() {
			le && (le = !1, document.removeEventListener("mousemove", he), document.removeEventListener("mouseup", J), document.removeEventListener("touchmove", he), document.removeEventListener("touchend", J), setTimeout(() => ae--, 0));
		}
		function me(e, t) {
			if (!u.value) return;
			we(), le = !0, ae++;
			let { clientX: n, clientY: r } = oe(e);
			ue = t, de = n, fe = r, pe = p.value, G = m.value, K = C(g.value), q = C(b.value), document.addEventListener("mousemove", he), document.addEventListener("mouseup", J), document.addEventListener("touchmove", he, { passive: !1 }), document.addEventListener("touchend", J);
		}
		function he(e) {
			if (!le) return;
			e.preventDefault();
			let t = D(), { clientX: n, clientY: r } = oe(e), i = (n - de) / t, a = (r - fe) / t, o = pe, s = G, c = K, l = q;
			switch (ue) {
				case "n":
					s = G + a, l = q - a;
					break;
				case "s":
					l = q + a;
					break;
				case "e":
					c = K + i;
					break;
				case "w":
					o = pe + i, c = K - i;
					break;
				case "ne":
					s = G + a, l = q - a, c = K + i;
					break;
				case "nw":
					o = pe + i, s = G + a, c = K - i, l = q - a;
					break;
				case "se":
					c = K + i, l = q + a;
					break;
				case "sw":
					o = pe + i, c = K - i, l = q + a;
					break;
			}
			c < 10 && (c = 10), l < 10 && (l = 10), p.value = o, m.value = s, g.value = c, b.value = l;
		}
		let ge = !1, _e = 0, ve = 0, ye = 0, be = 0;
		function xe() {
			ge && (ge = !1, document.removeEventListener("mousemove", Ce), document.removeEventListener("mouseup", xe), document.removeEventListener("touchmove", Ce), document.removeEventListener("touchend", xe), setTimeout(() => ae--, 0));
		}
		function Se(e) {
			if (!u.value) return;
			we(), ge = !0, ae++;
			let t = l.value.getBoundingClientRect(), { clientX: n, clientY: r } = oe(e);
			_e = t.left + t.width / 2, ve = t.top + t.height / 2, ye = Math.atan2(r - ve, n - _e), be = S.value, document.addEventListener("mousemove", Ce), document.addEventListener("mouseup", xe), document.addEventListener("touchmove", Ce, { passive: !1 }), document.addEventListener("touchend", xe);
		}
		function Ce(e) {
			if (!ge) return;
			e.preventDefault();
			let { clientX: t, clientY: n } = oe(e), r = Math.atan2(n - ve, t - _e) - ye;
			S.value = be + 180 / Math.PI * r;
		}
		function we() {
			U(), J(), xe();
		}
		k(), v(() => {
			document.addEventListener("click", Te);
		}), y(() => {
			document.removeEventListener("click", Te);
		});
		function Te(e) {
			u.value && (ae > 0 || l.value && (l.value.contains(e.target) || N()));
		}
		return (n, r) => (x(), o("div", {
			ref_key: "el",
			ref: l,
			class: h(["sp-drag", { "sp-drag-editing": u.value }]),
			style: _(L.value),
			onDblclick: F,
			onMousedown: ce,
			onTouchstart: H,
			"data-debug": t.editableIndex
		}, [s("div", { class: h(["sp-drag-content", { "sp-drag-content-blocked": u.value }]) }, [E(n.$slots, "default", {}, void 0, !0)], 2), u.value ? (x(), o("div", $n, [
			r[1] ||= s("div", { class: "sp-drag-edit-border" }, null, -1),
			(x(), o(e, null, T(d, (e) => s("div", {
				key: e,
				class: h(["sp-drag-handle", "sp-handle-" + e]),
				onMousedown: I((t) => me(t, e), ["stop"]),
				onTouchstart: I((t) => me(t, e), ["stop", "prevent"])
			}, null, 42, er)), 64)),
			r[2] ||= s("div", { class: "sp-drag-rotate-line" }, null, -1),
			s("div", {
				class: "sp-drag-rotate-handle",
				onMousedown: I(Se, ["stop"]),
				onTouchstart: I(Se, ["stop", "prevent"])
			}, null, 32),
			s("button", {
				class: "sp-drag-save-btn",
				title: te.value,
				onMousedown: r[0] ||= I(() => {}, ["stop"]),
				onClick: I(N, ["stop"])
			}, " Save ", 40, tr)
		])) : a("", !0)], 46, Qn));
	}
}), rr = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, ir = /*#__PURE__*/ rr(nr, [["__scopeId", "data-v-7f4de1ee"]]), ar = ["src", "alt"], or = {
	key: 1,
	class: "sp-img-loading"
}, sr = /*#__PURE__*/ rr(/* @__PURE__ */ d({
	__name: "SpImg",
	props: {
		src: {},
		alt: { default: "" }
	},
	setup(e) {
		let t = e, n = w("");
		async function r() {
			let e = t.src;
			if (!e) {
				n.value = "";
				return;
			}
			if (e.startsWith("data:") || e.startsWith("blob:")) {
				n.value = e;
				return;
			}
			if (e.match(/\.svg(\?|#|$)/i)) {
				let t = Pe(e);
				if (t.value) {
					n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
					return;
				}
				try {
					if (await Ie(e), t.value) {
						n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
						return;
					}
				} catch {}
				n.value = e;
				return;
			}
			let r = Fe(e);
			if (r.value) {
				n.value = r.value;
				return;
			}
			try {
				if (await Le(e), r.value) {
					n.value = r.value;
					return;
				}
			} catch {}
			n.value = e;
		}
		return P(() => t.src, r, { immediate: !0 }), (t, r) => n.value ? (x(), o("img", {
			key: 0,
			src: n.value,
			alt: e.alt,
			class: h(t.$attrs.class),
			style: _(t.$attrs.style)
		}, null, 14, ar)) : (x(), o("span", or, "…"));
	}
}), [["__scopeId", "data-v-9678aed9"]]), cr = /* @__PURE__ */ d({
	__name: "SpStep",
	props: {
		from: {},
		to: {},
		until: {},
		only: {},
		hide: { type: Boolean },
		animation: {}
	},
	setup(e) {
		let t = e, n = j();
		return v(() => {
			m(() => {
				let e = n.default?.() ?? [];
				for (let n of e) if (typeof n == "object" && n.el && n.el.nodeType === 1) {
					let e = n.el;
					if (t.from !== void 0 && e.setAttribute("data-sp-step-from", String(t.from)), t.to !== void 0 && e.setAttribute("data-sp-step-to", String(t.to)), t.until !== void 0) {
						let n = typeof t.until == "string" ? parseInt(t.until, 10) : t.until;
						e.setAttribute("data-sp-step-to", String(n - 1));
					}
					if (t.only !== void 0) {
						let n = typeof t.only == "string" ? parseInt(t.only, 10) : t.only;
						e.setAttribute("data-sp-step-from", String(n)), e.setAttribute("data-sp-step-to", String(n));
					}
					t.hide && e.setAttribute("data-sp-step-hide", ""), t.animation && e.setAttribute("data-sp-step-animation", t.animation);
					break;
				}
			});
		}), (e, t) => E(e.$slots, "default");
	}
}), lr = /* @__PURE__ */ d({
	__name: "SpStyle",
	props: { css: { default: "" } },
	setup(e) {
		let t = e, n = f("slideNum", void 0), r = j(), i = w(null);
		function a() {
			return t.css ? t.css : (r.default?.() ?? []).map((e) => {
				let t = e.children;
				return typeof t == "string" ? t : Array.isArray(t) ? t.map((e) => typeof e == "string" ? e : "").join("") : "";
			}).join("");
		}
		function o(e) {
			let t = n?.value;
			return t === void 0 ? e : `.sp-slide-${t} { ${e} }`;
		}
		return v(() => {
			let e = a();
			if (!e) return;
			let t = document.createElement("style");
			t.textContent = o(e), document.head.appendChild(t), i.value = t;
		}), y(() => {
			i.value?.remove();
		}), (e, t) => null;
	}
});
//#endregion
//#region src/composables/useSlideTree.ts
function ur(e) {
	return { tree: n(() => {
		let t = [];
		for (let n = 0; n < e.value.length; n++) {
			let r = e.value[n];
			if (r.noToc) continue;
			let i = document.createElement("div");
			i.innerHTML = r.html, i.querySelectorAll("h1,h2,h3").forEach((e) => {
				let i = e.textContent?.trim();
				i && t.push({
					slideIndex: n,
					slideNum: r.num,
					level: parseInt(e.tagName[1], 10),
					text: i
				});
			});
		}
		return t;
	}) };
}
//#endregion
//#region src/components/SpToc.vue?vue&type=script&setup=true&lang.ts
var dr = {
	key: 0,
	class: "sp-toc"
}, fr = {
	key: 0,
	class: "sp-toc-section"
}, pr = ["onClick"], mr = { class: "sp-toc-text" }, hr = /* @__PURE__ */ d({
	__name: "SpToc",
	props: {
		start: { default: 2 },
		end: { default: 999 },
		highlight: { default: 0 },
		context: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let r = t, i = (e) => {
			let t = typeof e == "string" ? parseInt(e, 10) : e;
			if (isNaN(t)) throw Error(`Invalid number: ${e}`);
			return t;
		}, c = f("slides"), l = f("slideIndex"), u = f("goTo"), { tree: d } = ur(n(() => c.value)), p = n(() => l.value + i(r.highlight)), m = n(() => {
			let e = d.value, t = e.filter((e) => e.level >= i(r.start) && e.level <= i(r.end));
			if (i(r.start) > 1) {
				let n = i(r.start) - 1, a = p.value, o = e.slice().reverse().find((e) => e.level === n && e.slideIndex <= a);
				if (!o) console.warn(`[sp-toc] no h${n} before slide ${a + 1}, showing all`);
				else {
					let n = e.filter((e) => e.level < i(r.start)), a = n.indexOf(o), s = o.slideIndex, c = a + 1 < n.length ? n[a + 1].slideIndex : Infinity;
					t = t.filter((e) => e.slideIndex >= s && e.slideIndex < c);
				}
			}
			return t;
		}), g = n(() => {
			if (i(r.start) <= 1) return null;
			let e = d.value, t = i(r.start) - 1, n = p.value;
			return e.slice().reverse().find((e) => e.level === t && e.slideIndex <= n) ?? null;
		});
		return (t, n) => m.value.length ? (x(), o("nav", dr, [E(t.$slots, "default", {
			items: m.value,
			currentIndex: A(l).value,
			goTo: A(u),
			activeSection: g.value
		}, () => [r.context && g.value ? (x(), o("div", fr, k(g.value.text), 1)) : a("", !0), s("ol", null, [(x(!0), o(e, null, T(m.value, (e) => (x(), o("li", {
			key: e.slideIndex,
			class: h(["sp-toc-h" + e.level, { "sp-toc-active": e.slideIndex === p.value }]),
			onClick: (t) => A(u)(e.slideIndex)
		}, [s("span", mr, k(e.text), 1)], 10, pr))), 128))])])])) : a("", !0);
	}
}), gr = 1, _r = {
	"": 1,
	px: 1,
	cm: 96 / 2.54,
	mm: 96 / 10 / 2.54,
	Q: 96 / 40 / 2.54,
	in: 96,
	pc: 96 / 6,
	pt: 96 / 72
};
function vr(e) {
	if (!e) return 0;
	let t = e.match(/^([\d.]+)(\w*)$/);
	return t ? parseFloat(t[1]) * (_r[t[2]] ?? 1) : 0;
}
var yr = (e) => {
	let t = e.querySelector("svg");
	if (!t || t.getAttribute("viewBox")) return;
	let n = vr(t.getAttribute("width")), r = vr(t.getAttribute("height"));
	n && r && (t.setAttribute("viewBox", `0 0 ${n} ${r}`), t.removeAttribute("width"), t.removeAttribute("height"));
}, br = (e) => {
	e.querySelectorAll("[*|href]:not([href])").forEach((e) => {
		let t = e.getAttributeNS("http://www.w3.org/1999/xlink", "href");
		t && (e.setAttribute("href", t), e.removeAttributeNS("http://www.w3.org/1999/xlink", "href"));
	});
}, xr = (e) => {
	let t = {}, n = {};
	e.querySelectorAll("*").forEach((e) => {
		let r = e.id;
		r && (t[r] = e);
		for (let t of [
			"clip-path",
			"color-profile",
			"fill",
			"filter",
			"marker-start",
			"marker-mid",
			"marker-end",
			"mask",
			"stroke"
		]) {
			let r = e.getAttribute(t);
			if (!r) continue;
			let i = r.trim().match(/^url\(#(.+?)\)$/);
			i && (n[i[1]] ??= []).push({
				el: e,
				attr: t
			});
		}
		let i = e.getAttribute("href")?.trim();
		i?.startsWith("#") && (n[i.slice(1)] ??= []).push({
			el: e,
			attr: "href"
		});
	});
	for (let e in n) {
		let r = t[e];
		if (!r) continue;
		let i = `svgid-${gr++}`;
		r.id = i;
		for (let { el: t, attr: r } of n[e]) {
			let n = t.getAttribute(r);
			t.setAttribute(r, n.replace("#" + e, "#" + i));
		}
	}
}, Sr = (e) => {
	e.querySelectorAll("[style]").forEach((e) => {
		let t = e.getAttribute("style");
		t && (t.split(";").forEach((t) => {
			let n = t.trim();
			if (!n || n.startsWith("-")) return;
			let [r, ...i] = n.split(":").map((e) => e.trim());
			r && i.length && e.setAttribute(r, i.join(":"));
		}), e.removeAttribute("style"));
	});
}, Cr = [
	yr,
	br,
	xr,
	Sr
], wr = /*#__PURE__*/ rr(/* @__PURE__ */ d({
	__name: "SpSvg",
	props: {
		src: {},
		path: { default: "svg" },
		wrap: {
			type: Boolean,
			default: !1
		},
		width: {},
		height: {}
	},
	setup(e) {
		let t = e, r = n(() => {
			let e = [...Cr];
			return t.width != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("width", String(t.width));
			}), t.height != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("height", String(t.height));
			}), e;
		});
		return (t, n) => e.wrap ? (x(), o("div", p({ key: 0 }, t.$attrs, { class: "sp-svg-wrap" }), [l(Nr, {
			src: e.src,
			path: e.path,
			transformers: r.value,
			"no-fix-void": "",
			"no-component": ""
		}, null, 8, [
			"src",
			"path",
			"transformers"
		])], 16)) : (x(), i(Nr, p({ key: 1 }, t.$attrs, {
			src: e.src,
			path: e.path,
			transformers: r.value,
			"no-fix-void": "",
			"no-component": ""
		}), null, 16, [
			"src",
			"path",
			"transformers"
		]));
	}
}), [["__scopeId", "data-v-1d4193db"]]), Tr = {
	key: 0,
	class: "sp-slide-source"
}, Er = { class: "sp-slide-source-header" }, Dr = ["innerHTML"], Or = /*#__PURE__*/ rr(/* @__PURE__ */ d({
	__name: "SpSlideSource",
	props: {
		for: { default: void 0 },
		transform: {
			type: [Function, null],
			default: null
		}
	},
	setup(e) {
		let t = e, r = f("rawSlideSources"), i = f("slideIndex"), l = n(() => t.for === void 0 ? i.value : t.for), u = w(""), d = 0;
		return P([
			l,
			() => t.transform,
			r
		], async ([e]) => {
			let n = r.value[e];
			if (!n) {
				u.value = "";
				return;
			}
			let i = ++d, a = `<pre><code class="language-html">${(t.transform ? t.transform(n) : n).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
			try {
				let e = await Cn(a);
				i === d && (u.value = e);
			} catch {
				i === d && (u.value = a);
			}
		}, { immediate: !0 }), (e, t) => u.value ? (x(), o("div", Tr, [s("div", Er, [E(e.$slots, "header", { forSlide: l.value }, () => [c(" Slide " + k(l.value + 1) + " source ", 1)], !0)]), s("div", {
			class: "sp-slide-source-body",
			innerHTML: u.value
		}, null, 8, Dr)])) : a("", !0);
	}
}), [["__scopeId", "data-v-8a380df0"]]), kr = ["data-source-file-push"], Ar = ["innerHTML"], jr = /*@__PURE__*/ d({
	__name: "SpInclude",
	props: {
		src: {},
		path: { default: "" },
		transformers: { default: () => [] },
		noFixVoid: {
			type: Boolean,
			default: !1
		},
		noComponent: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let n = f("contentVersion"), r = f("sp-components", {}), a = u(() => Promise.resolve().then(() => Mr)), c = t, l = w(""), h = w(""), _ = O(null), v = w(null);
		y(() => {
			v.value && clearTimeout(v.value);
		});
		function b(e) {
			c.noFixVoid || (e = ye(e)), e = be(e);
			let t = document.createElement("div");
			if (t.innerHTML = e, c.path) {
				let e = t.querySelector(c.path);
				if (!e) return "";
				t.innerHTML = "", t.appendChild(e.cloneNode(!0));
			}
			for (let e of c.transformers) e(t);
			return t.innerHTML;
		}
		function S(e) {
			if (!e) {
				_.value = null;
				return;
			}
			_.value = d({
				template: `<div class="sp-include">${e}</div>`,
				components: {
					"sp-alternatives": Xn,
					"sp-anim": Zn,
					"sp-drag": ir,
					"sp-img": sr,
					"sp-include": a,
					"sp-step": cr,
					"sp-style": lr,
					"sp-toc": hr,
					"sp-svg": wr,
					"sp-slide-source": Or,
					...r
				}
			});
		}
		function C() {
			m(() => {
				n.value++;
			});
		}
		return P(Pe(c.src), async (e) => {
			if (e) v.value &&= (clearTimeout(v.value), null), l.value = "", h.value = b(e), c.noComponent || S(h.value), C();
			else if (e === void 0) {
				if (v.value) return;
				v.value = setTimeout(() => {
					_.value = null, v.value = null;
				}, 500);
				try {
					await Ie(c.src);
				} catch (e) {
					l.value = `${e.message} (src: ${c.src})`, v.value &&= (clearTimeout(v.value), null);
				}
			}
		}, { immediate: !0 }), (n, r) => (x(), o(e, null, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": t.src
			}, null, 8, kr),
			l.value ? (x(), o("div", p({ key: 0 }, n.$attrs, { class: "sp-include-error" }), k(l.value), 17)) : c.noComponent ? (x(), o("div", p({ key: 1 }, n.$attrs, {
				class: "sp-include",
				innerHTML: h.value
			}), null, 16, Ar)) : (x(), i(D(_.value), g(p({ key: 2 }, n.$attrs)), null, 16)),
			r[0] ||= s("span", {
				style: { display: "none" },
				"data-source-file-pop": ""
			}, null, -1)
		], 64));
	}
}), Mr = /* @__PURE__ */ L({ default: () => Nr }), Nr = /*#__PURE__*/ rr(jr, [["__scopeId", "data-v-a3f50969"]]), Pr = {
	"sp-alternatives": Xn,
	"sp-anim": Zn,
	"sp-drag": ir,
	"sp-img": sr,
	"sp-include": Nr,
	"sp-svg": wr,
	"sp-step": cr,
	"sp-style": lr,
	"sp-toc": hr,
	"sp-slide-source": Or
};
function Fr(e) {
	return typeof e == "string" ? document.querySelector(e) : e ?? null;
}
async function Ir(e = {}) {
	let { slides: t, el: n, transition: i, transitionDuration: a, designWidth: o, designHeight: s, author: c, components: l, seed: u, cacheIgnore: d, plugins: f, activate: p } = e, m = document.getElementById("sp-content"), h = document.getElementById("sp-cache"), g = {}, _ = null, v = [];
	if (m) {
		let e = await Q(m.textContent || "");
		v.push(...ae(e));
		let t = be(ye(e));
		_ = document.createElement("div"), _.innerHTML = t;
	}
	if (!t) {
		if (h?.content) {
			let e = h.content.textContent?.trim();
			e && ze(e);
		}
		_ && (t = ie(_), i && t.forEach((e) => {
			e.transition === "" && (e.transition = i);
		}));
	}
	_ && re(_, g);
	let y = document.getElementById("sp-chunklets");
	if (y?.content && (V.chunkletDefs = wn(y.content)), !o || !s || !c || !u) {
		let e = document.getElementById("sp-presentation");
		if (e) {
			let t = e.getAttribute("data-design-width"), n = e.getAttribute("data-design-height");
			t && n && (o = parseInt(t, 10), s = parseInt(n, 10));
			let r = e.getAttribute("data-author");
			r && (c = r);
			let i = e.dataset.seed;
			i && (u = parseInt(i, 10));
		}
	}
	let b = [];
	function x(e) {
		Array.from(e.children).forEach((e) => {
			if (["sp-style", "style"].includes(e.tagName.toLowerCase())) {
				let t = e.textContent?.trim();
				if (!t) return;
				let n = document.createElement("style");
				n.textContent = t, document.head.appendChild(n), b.push(n);
			}
		});
	}
	function S() {
		b.forEach((e) => e.remove()), b = [];
	}
	function C(e) {
		S();
		let t = document.createElement("div");
		t.innerHTML = e, x(t);
	}
	if (d && je(d), _) {
		x(_);
		let e = [];
		_.querySelectorAll("sp-include").forEach((t) => {
			let n = t.getAttribute("src");
			n && e.push(Ie(n));
		});
		let t = /* @__PURE__ */ new Set();
		_.querySelectorAll("img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), _.querySelectorAll("sp-img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), t.forEach((t) => {
			t.match(/\.svg(\?|#|$)/i) ? e.push(Ie(t)) : e.push(Le(t));
		}), await Promise.all(e);
	}
	let T = {
		...Pr,
		...l
	}, E = Fr(n) ?? document.getElementById("sp-presentation") ?? document.getElementById("app") ?? document.body, D = new URLSearchParams(window.location.search), O = e.presenter ?? D.has("presenter");
	Object.assign(se, {
		transition: i,
		transitionDuration: a,
		designWidth: o,
		designHeight: s,
		author: c,
		seed: u,
		raw: g,
		el: "#app"
	});
	let k = [...f ?? []];
	p && k.unshift({
		name: "__user__",
		order: 100,
		activate: p
	});
	let A = k.sort((e, t) => (e.order ?? 0) - (t.order ?? 0));
	for (let e of A) await G.register(e);
	let j = r(Yn, {
		slides: t,
		rawSlideSources: v,
		transition: i,
		transitionDuration: a,
		designWidth: o,
		designHeight: s,
		author: c,
		seed: u,
		raw: g,
		components: T,
		presenter: O
	});
	j.config.globalProperties.$sp = V, j.provide("sp-api", V), j.provide("sp-registry", G);
	let M = w(0);
	j.provide("liveUpdatesCount", M), typeof globalThis < "u" && (globalThis.__sp__ = V);
	let N = j.mount(E);
	if (j.use = async (e) => (await G.register(e), N.rebuildKeymap(), j), typeof EventSource < "u" && window.location.hostname === "localhost") {
		let e = new EventSource("/__sp_events"), t = (e) => {
			let t = 0;
			for (let n of e) t = (t << 5) - t + n.charCodeAt(0), t |= 0;
			return t;
		}, n = parseInt(window.localStorage.getItem("sp-non-content-hash") ?? "0", 10);
		e.addEventListener("update", (e) => {
			M.value++;
			let r = (e.data ?? "").trim();
			r ? He(r) : Ve(), fetch(window.location.href + "?_=" + Date.now()).then((e) => e.text()).then((e) => {
				let r = t(e.replace(/<script\s+type="text\/html"\s+id="sp-content">[\s\S]*?<\/script>/, ""));
				if (n !== 0 && n !== r) {
					window.localStorage.setItem("sp-non-content-hash", r.toString()), window.location.reload();
					return;
				}
				n = r;
				let i = e.match(/<script\s+type="text\/html"\s+id="sp-content">([\s\S]*?)<\/script>/);
				i && (async () => {
					let e = await Q(i[1]);
					me(), N.updateSlides?.(e), C(e);
				})().catch(() => {});
			}).catch(() => {});
		}), e.addEventListener("connected", () => {}, { once: !0 });
	}
	return j.export = vn, j;
}
//#endregion
export { Xn as SpAlternatives, Zn as SpAnim, ir as SpDrag, sr as SpImg, Nr as SpInclude, Yn as SpPresentation, bt as SpSlide, Or as SpSlideSource, lr as SpStyle, wr as SpSvg, hr as SpToc, yr as addViewBox, ct as bind, En as chunkPlacementMode, lt as createDefaultKeymap, Ir as createSlidesPurryst, Cr as defaultTransformers, K as definePlugin, vn as exportStandalone, xr as idRewrite, pe as injectStyle, fe as listAnimActionTypes, ue as listAnimCommands, H as parseArgs, wn as parseChunklets, ie as parseElementToSlides, Y as processSlideHtml, de as registerAnimActionType, le as registerAnimCommand, G as registry, vt as resetConfig, V as spApi, Sr as styleToAttributes, Tn as substituteParams, Ht as useElementScale, st as useKeymap, ut as useNavigation, dt as usePresenter, ft as useScale, ur as useSlideTree, oe as useSlides, Ee as useSteps, _t as useStorage, br as xlinkRewrite };
