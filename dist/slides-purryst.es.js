import { Fragment as e, Teleport as t, computed as n, createApp as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createStaticVNode as c, createTextVNode as l, createVNode as u, defineAsyncComponent as d, defineComponent as f, inject as p, mergeProps as m, nextTick as h, normalizeClass as g, normalizeProps as _, normalizeStyle as v, onMounted as y, onUnmounted as b, onUpdated as x, openBlock as S, provide as C, reactive as w, ref as T, renderList as E, renderSlot as D, resolveDynamicComponent as O, shallowRef as k, toDisplayString as A, unref as j, useSlots as M, vModelText as ee, vShow as te, watch as N, watchEffect as ne, withDirectives as re, withKeys as P, withModifiers as F } from "vue";
//#region \0rolldown/runtime.js
var ie = Object.defineProperty, I = (e, t) => {
	let n = {};
	for (var r in e) ie(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || ie(n, Symbol.toStringTag, { value: "Module" }), n;
}, L = new Set("area base br col embed hr img input link meta param> source track wbr".split(" "));
function R(e) {
	if (e.nodeType === Node.TEXT_NODE) return e.textContent || "";
	if (e.nodeType === Node.COMMENT_NODE) return `<!--${e.textContent}-->`;
	if (e.nodeType !== Node.ELEMENT_NODE) return "";
	let t = e, n = t.tagName.toLowerCase();
	if (n === "sp-notes") return "";
	if (L.has(n)) {
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
	for (let e = 0; e < i.length; e++) r += R(i[e]);
	return r += `</${n}>`, r;
}
function z(e) {
	let t = "";
	for (let n = 0; n < e.childNodes.length; n++) t += R(e.childNodes[n]);
	return t;
}
function ae(e, t) {
	e.querySelectorAll("sp-before").forEach((e) => {
		let n = z(e).trim();
		n && (t.before = (t.before ?? "") + n);
	}), e.querySelectorAll("sp-after").forEach((e) => {
		let n = z(e).trim();
		n && (t.after = (t.after ?? "") + n);
	});
}
function B(e) {
	let t = e.querySelectorAll("sp-slide"), n = [];
	return t.forEach((e, t) => {
		let r = z(e).trim();
		if (!r) return;
		let i = e.getAttribute("notes") ?? void 0;
		if (!i) {
			let t = e.querySelector("sp-notes");
			t && (i = z(t).trim());
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
			sourceFile: e.getAttribute("data-source-file") || void 0,
			sourceLine: (() => {
				let t = e.getAttribute("data-source-line");
				if (t == null) return;
				let n = parseInt(t, 10);
				return Number.isFinite(n) ? n : void 0;
			})(),
			notes: i
		});
	}), n;
}
function oe(e) {
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
function se(e) {
	let t = T(e ?? []), r = T(0), i = n(() => t.value[r.value] ?? null), a = n(() => t.value.length);
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
var V = w({
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
	showChunkletsBar: !1,
	chunkletDefs: [],
	chunkletMode: !1,
	selectedChunklet: null
}), ce = {}, H = /* @__PURE__ */ new Set();
//#endregion
//#region src/animCommands.ts
function U(e) {
	let t = [], n = "", r = null;
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		r ? a === r ? r = null : n += a : a === "\"" || a === "'" ? r = a : a === "," ? (t.push(n.trim()), n = "") : n += a;
	}
	return t.push(n.trim()), t;
}
var W = {
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
function le(e, t) {
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
			return le(e, t).map((e) => [e]);
		},
		init(e, t) {
			let n = t.querySelector(e);
			if (n) for (let e of n.children) e.classList.add("sp-anim-hidden"), e.classList.remove("sp-anim-shown");
		}
	},
	child: {
		countSteps: () => 1,
		parse(e) {
			let t = U(e), n = t[0] ?? "";
			if (!n) return [];
			if (t.length >= 3) {
				let e = parseInt(t[1]), r = parseInt(t[2]);
				return isNaN(e) || isNaN(r) ? [] : [{
					type: "show",
					selector: `${n} > :nth-child(n+${e}):nth-child(-n+${r})`
				}];
			}
			let r = parseInt(t[1] ?? "");
			return isNaN(r) ? [] : [{
				type: "show",
				selector: `${n} > :nth-child(${r})`
			}];
		}
	},
	add: {
		countSteps: () => 1,
		parse(e) {
			let t = U(e);
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
			let t = U(e);
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
			let t = U(e);
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
				selector: U(e)[0] || "video"
			}];
		}
	}
}, V._animActionTypes = { ...W };
function ue(e) {
	return V._animCommands[e];
}
function de(e, t) {
	V._animCommands[e] = t;
}
function fe() {
	return Object.keys(V._animCommands);
}
function pe(e, t) {
	V._animActionTypes[e] = t;
}
function me() {
	return Object.keys(V._animActionTypes);
}
//#endregion
//#region src/plugin.ts
function G(e) {
	let t = document.createElement("style");
	t.textContent = e, document.head.appendChild(t);
}
var K = {
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
			injectStyle: n.includes("style") ? t : G,
			addChunklet: n.includes("chunklet") ? t : (e) => V.chunkletDefs.push(e),
			addDomTransform: n.includes("domTransform") ? t : (e) => this._domTransforms.push(e)
		}, i = e.activate(r), a = i instanceof Promise ? await i : i;
		if (a) {
			let t = this._teardowns.get(e.name) ?? [];
			t.push(a), this._teardowns.set(e.name, t);
		}
	},
	applyAnimRegistrations() {
		for (let { name: e, handler: t } of this._animCommands) de(e, t);
		for (let { type: e, handler: t } of this._animActionTypes) pe(e, t);
	},
	unregister(e) {
		let t = this._plugins.findIndex((t) => t.name === e);
		t < 0 || ((this._teardowns.get(e) ?? []).forEach((e) => e()), this._teardowns.delete(e), this._plugins.splice(t, 1));
	}
};
function he(e) {
	return e;
}
var ge = T([]);
function q(e) {
	ge.value.length >= 10 && ge.value.shift(), ge.value.push(e);
}
function _e() {
	ge.value = [];
}
//#endregion
//#region src/composables/useSteps.ts
function ve(e, t) {
	if (!e.trim()) return 0;
	let n = e.split("|").map((e) => e.trim()), r = 0;
	for (let e of n) {
		let n = e.match(/^@(\w+)\((.+)\)$/);
		if (n) {
			let e = ue(n[1]);
			e ? r += e.countSteps(n[2], t) : r += 1;
		} else r += 1;
	}
	return r;
}
function ye(e) {
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
var be = /* @__PURE__ */ RegExp("<(sp-anim|sp-jump|sp-pause|sp-meanwhile|sp-toc|sp-include|sp-svg|sp-slide-source)(\\s[^>]*)?/>", "gi"), xe = /* @__PURE__ */ RegExp("<(sp-drag|sp-slide)(\\s[^>]*)?(/?)>", "gi");
function Se(e) {
	return e.replace(be, "<$1$2></$1>");
}
function Ce(e) {
	let t = 0;
	return e.replace(xe, (e, n, r, i) => {
		let a = `<${n} :editable-index="${t}"${i || ""}${r || ""}>`;
		return (r ?? "").includes(":editable-index=") ? e : (t++, a);
	});
}
function we(e) {
	return e.replace(/(\p{Emoji_Presentation})/gu, (e) => `<span style="display: inline-flex; vertical-align: middle; line-height: 0;"><svg viewBox="0 0 100 100" style="width:1em; height:1em; display: inline-block;"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${e}</text></svg></span>`);
}
function J(e) {
	e.querySelectorAll("sp-pause").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "+1"), e.replaceWith(t);
	}), e.querySelectorAll("sp-meanwhile").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "0"), e.replaceWith(t);
	});
}
function Y(e) {
	let t = 0, n = (e) => {
		let r = Array.from(e.children);
		for (let e of r) e.tagName.toLowerCase() === "sp-step" && (e.getAttribute("also") === null ? t = parseInt(e.getAttribute("from") || "0", 10) : (e.setAttribute("from", String(t)), e.removeAttribute("also"))), n(e);
	};
	n(e);
}
function Te(e) {
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
function Ee(e) {
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
					let { relative: e, value: i } = ye(n.getAttribute("at"));
					e ? t += i : t = i, o.push(n), r(t);
					continue;
				}
				if (a === "sp-anim") {
					let i = [null, "false"].includes(n.getAttribute("no-jump")), a = n.getAttribute("at") ?? "+0", o = t, { relative: s, value: c } = ye(a);
					s ? o += c : o = c - 1, n.setAttribute("at", String(o));
					try {
						o += ve(n.getAttribute("spec") || "", e);
					} catch (e) {
						console.error("(Caught) Error counting anim spec parts:", e), q(`Error counting anim spec parts for <sp-anim> at step ${t}: ${e}`);
					}
					i ? (t = o, r(t)) : r(o);
				}
				if (a === "sp-alternatives") {
					let { relative: e, value: i } = ye(n.getAttribute("at") ?? "+0");
					e ? t += i : t = i, t += n.childElementCount, r(t - 1), s = !0, c = !0;
				}
				if (a === "sp-steps" || !s && n.hasAttribute("sp-steps")) {
					let e = n.getAttribute("at") ?? "+1", i = [null, "false"].includes(n.getAttribute("no-jump")), o = parseInt(n.getAttribute("every") || "1", 10), l = n.getAttribute("animation") || "", u = t, d = ye(e);
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
function De(e) {
	for (let t of K._domTransforms) t(e);
}
function Oe(e) {
	let t = document.createElement("div");
	t.innerHTML = e, J(t), Y(t), Te(t);
	let n = Ee(t);
	return De(t), {
		html: t.innerHTML,
		steps: n
	};
}
function ke() {
	let e = T(0), t = T(1), r = n(() => e.value === 0), i = n(() => t.value <= 1 || e.value >= t.value - 1);
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
		processSlideHtml: Oe
	};
}
function Ae(e) {
	return e == null ? null : Oe(e.html);
}
//#endregion
//#region src/composables/includeCache.ts
var X = /* @__PURE__ */ new Map(), je = /* @__PURE__ */ new Map(), Me = /* @__PURE__ */ new Map(), Ne = /* @__PURE__ */ new Map(), Pe = [];
function Fe(e) {
	Pe = e.map((e) => new RegExp(e));
}
function Ie(e) {
	return Pe.some((t) => t.test(e));
}
var Z = /* @__PURE__ */ new Map();
function Le(e, t) {
	Z.set(e, {
		size: t ? t.length : 0,
		timestamp: Date.now()
	});
}
function Re(e) {
	let t = X.get(e);
	return t || (t = T(void 0), X.set(e, t)), t;
}
function ze(e) {
	let t = je.get(e);
	return t || (t = T(void 0), je.set(e, t)), t;
}
function Be(e) {
	if (Ie(e)) return Promise.resolve();
	let t = Re(e);
	if (t.value !== void 0) return Promise.resolve();
	if (Me.has(e)) return Me.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.text();
	}).then((n) => {
		t.value = n, Le(e, n), Me.delete(e);
	}).catch(() => {
		t.value = "", Le(e), Me.delete(e);
	});
	return Me.set(e, n), n;
}
function Ve(e) {
	if (Ie(e)) return Promise.resolve();
	let t = ze(e);
	if (t.value !== void 0) return Promise.resolve();
	if (Ne.has(e)) return Ne.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.blob();
	}).then((e) => new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(r.result), r.onerror = n, r.readAsDataURL(e);
	})).then((n) => {
		t.value = n, Le(e, n), Ne.delete(e);
	}).catch(() => {
		t.value = "", Le(e), Ne.delete(e);
	});
	return Ne.set(e, n), n;
}
function He() {
	let e = {};
	for (let [t, n] of X) n.value !== void 0 && (e[t] = n.value);
	let t = {};
	for (let [e, n] of je) n.value !== void 0 && (t[e] = n.value);
	return JSON.stringify({
		text: e,
		binary: t
	});
}
function Ue(e) {
	let t = JSON.parse(e), n = Date.now();
	if (t.text) for (let [e, r] of Object.entries(t.text)) Re(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
	else for (let [e, r] of Object.entries(t)) Re(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
	if (t.binary) for (let [e, r] of Object.entries(t.binary)) ze(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
}
function We() {
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
	for (let [t] of je) {
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
function Ge() {
	for (let e of X.values()) e.value = void 0;
	for (let [e] of X) Z.delete(e);
	Me.clear();
}
function Ke(e) {
	let t = window.location.href, n = new URL(e, t).href;
	for (let [e, r] of X) try {
		if (new URL(e, t).href === n) {
			r.value = void 0, Z.delete(e), Me.delete(e);
			return;
		}
	} catch {}
}
function qe() {
	for (let e of X.values()) e.value = void 0;
	for (let e of je.values()) e.value = void 0;
	X.clear(), je.clear(), Z.clear(), Me.clear(), Ne.clear();
}
function Je(e) {
	let t = X.get(e);
	t && (t.value = void 0);
	let n = je.get(e);
	n && (n.value = void 0), Z.delete(e);
}
//#endregion
//#region src/composables/resolveIncludes.ts
async function Ye(e) {
	let t = Re(e);
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
function Xe(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function Ze(e, t = /* @__PURE__ */ new Set(), n = window.location.pathname) {
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
			let n = await Ye(e);
			return n = Se(n), n = Ce(n), {
				src: e,
				content: await Ze(n, t, e)
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
		let n = RegExp(`<sp-include[^>]*?src="${Xe(e)}"[^>]*?(\\/?>|><\\/sp-include>)`, "g");
		l = l.replace(n, t);
	}
	return l;
}
function Qe(e) {
	if (!e) return null;
	let t = [];
	function n(e) {
		function r(e) {
			let n = e.getAttribute("data-source-file-push");
			n && t.push(n), e.hasAttribute("data-source-file-pop") && t.pop();
		}
		r(e);
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
var $e = [
	"Shift",
	"Meta",
	"Alt",
	"Control"
], Q = 1e3, et = "keydown", tt = typeof navigator == "object" ? navigator.platform : "", $ = /Mac|iPod|iPhone|iPad/.test(tt) ? "Meta" : "Control", nt = tt === "Win32" ? ["Control", "Alt"] : ["Alt"];
function rt(e) {
	return !!(e.key && e.code && e.getModifierState);
}
function it(e) {
	let t = e.target;
	return e.repeat || e.isComposing || t !== e.currentTarget && t.matches("[contenteditable],input,select,textarea");
}
function at(e, t) {
	return typeof e.getModifierState == "function" ? e.getModifierState(t) || nt.includes(t) && e.getModifierState("AltGraph") : !1;
}
function ot(e) {
	return e.trim().split(" ").map((e) => {
		let t = e.split(/(?<=\w|\])\+/), n = t.pop(), r = n.match(/^\((.+)\)$/), i = r ? RegExp(`^(?:${r[1]})$`, "iv") : n, a = [], o = [];
		for (let e of t) {
			let t = e.match(/^\[(.*)\]$/), n = t?.[1] ?? e;
			n = n === "$mod" ? $ : n, t ? o.push(n) : a.push(n);
		}
		return [
			a,
			o,
			i
		];
	});
}
function st(e, [t, n, r]) {
	let i = t.includes("AltGraph");
	return !((r instanceof RegExp ? !(r.test(e.key) || r.test(e.code)) : r.toUpperCase() !== e.key.toUpperCase() && r !== e.code) || t.find((t) => !at(e, t)) || $e.find((a) => !t.includes(a) && !n.includes(a) && r !== a && at(e, a) && !(i && nt.includes(a))));
}
function ct(e, t = {}) {
	let n = t.timeout ?? Q, r = t.ignore ?? it, i = Object.keys(e).map((t) => [
		t,
		ot(t),
		e[t]
	]), a = /* @__PURE__ */ new Map(), o = null;
	return (e) => {
		if (!rt(e) || r(e)) return;
		let t = [];
		for (let [n, r, o] of i) {
			let [i, ...s] = a.get(n) || r;
			if (!st(e, i)) at(e, e.key) || a.delete(n);
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
function lt(e, t, n = {}) {
	let r = n.event ?? et, i = ct(t, n);
	return e.addEventListener(r, i, n.capture), () => {
		e.removeEventListener(r, i, n.capture);
	};
}
//#endregion
//#region src/keymap/manager.ts
var ut = class {
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
		this._unsubscribe = lt(window, t, { ignore: (e) => it(e) || this._getContext().dragging });
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
function dt(e) {
	let t = new ut(e.getContext);
	for (let n of e.setupFns ?? []) t.addSetup(n);
	function n(e) {
		t.addSetup(e), t.rebuild();
	}
	function r(e) {
		t.removeSetup(e), t.rebuild();
	}
	return y(() => t.mount()), b(() => t.unmount()), {
		addSetup: n,
		removeSetup: r,
		rebuild: () => t.rebuild()
	};
}
//#endregion
//#region src/keymap/bind.ts
function ft(e, t) {
	let n = (t) => e(t);
	return t && (n.__bind = t), n;
}
//#endregion
//#region src/keymap/defaults.ts
function pt(e) {
	return (t) => {
		t.ArrowRight = t.Space = () => e.next(), t.ArrowLeft = () => e.prev(), t.ArrowUp = () => e.goToPrevBegin(), t.ArrowDown = () => e.goToNextBegin(), t.a = () => e.goToPrevEnd(), t.z = () => e.goToNextEnd(), t.Home = () => e.goTo(0), t.End = () => e.goTo(e.total.value - 1), t.f = ft(() => {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}, { preventDefault: !1 }), t.Escape = ft(() => {
			document.fullscreenElement && document.exitFullscreen().catch(() => {}), e.onOverviewExit?.(), e.onBlackoutExit?.();
		}, { preventDefault: !1 }), t.p = () => e.onPresenterToggle?.(), t.o = () => e.onOverviewToggle?.(), t.g = () => e.onGoPrompt?.(), t.b = () => e.onBlackoutToggle?.(), t.d = () => e.onDevPaneToggle?.(), t.c = () => e.onChunkBarToggle?.();
	};
}
//#endregion
//#region src/composables/useNavigation.ts
function mt(e, t) {
	let n = [pt(e), ...t?.extraSetups ?? []], { rebuild: r } = dt({
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
	return y(() => {
		window.addEventListener("touchstart", o, { passive: !0 }), window.addEventListener("touchend", s, { passive: !0 });
	}), b(() => {
		window.removeEventListener("touchstart", o), window.removeEventListener("touchend", s);
	}), { rebuildKeymap: r };
}
//#endregion
//#region src/composables/usePresenter.ts
function ht() {
	let e = T(null), t = null;
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
	return b(() => {
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
function gt(e = 1920, t = 1080) {
	let r = T(window.innerWidth), i = T(window.innerHeight);
	function a() {
		r.value = window.innerWidth, i.value = window.innerHeight;
	}
	let o = n(() => {
		let n = Math.min(r.value / e, i.value / t);
		return Math.min(n, 10);
	}), s = n(() => {
		let n = o.value;
		return {
			transform: `scale(${n}) translate(${(r.value - e * n) / (2 * n)}px, ${(i.value - t * n) / (2 * n)}px)`,
			transformOrigin: "top left",
			width: e + "px",
			height: t + "px",
			"--slide-transform-scale": `${o.value}`
		};
	}), c = n(() => ({
		width: r.value + "px",
		height: i.value + "px"
	}));
	return y(() => {
		a(), window.addEventListener("resize", a);
	}), b(() => {
		window.removeEventListener("resize", a);
	}), {
		transformStyle: s,
		containerStyle: c
	};
}
//#endregion
//#region src/composables/useStorage.ts
var _t = "sp-config", vt = {
	navLocked: !1,
	overviewScale: .15,
	proMode: !1,
	logSteps: !1,
	darkMode: "light"
};
function yt() {
	try {
		let e = localStorage.getItem(_t);
		return e ? {
			...vt,
			...JSON.parse(e)
		} : { ...vt };
	} catch {
		return { ...vt };
	}
}
var bt = w(yt());
N(bt, () => {
	try {
		localStorage.setItem(_t, JSON.stringify(bt));
	} catch {}
}, { deep: !0 });
function xt() {
	return bt;
}
function St() {
	for (let e of Object.keys(bt)) e in vt ? bt[e] = vt[e] : delete bt[e];
}
//#endregion
//#region src/composables/useBibFilter.ts
var Ct = "a[role=\"doc-biblioref\"]", wt = "sp-bib-hidden", Tt = "sp-bib-absent", Et = "sp-bib-empty";
function Dt(e) {
	return e.closest(".sp-anim-hidden, .sp-anim-only") === null;
}
function Ot(e, t, n) {
	let r = 0;
	e.querySelectorAll("li").forEach((e) => {
		let i = e.getAttribute("id");
		i !== null && t.has(i) ? (e.classList.remove(wt, Tt), r++) : (e.classList.add(wt), e.classList.toggle(Tt, i === null || !n.has(i)));
	}), e.classList.toggle(Et, r === 0);
}
function kt(e) {
	function t() {
		let t = e.getSlideEl();
		if (!t) return;
		let n = t.querySelectorAll(".sp-bib");
		if (n.length === 0) return;
		let r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
		t.querySelectorAll(Ct).forEach((e) => {
			let t = e.getAttribute("href");
			if (!t?.startsWith("#")) return;
			let n = t.slice(1);
			r.add(n), Dt(e) && i.add(n);
		}), n.forEach((e) => Ot(e, i, r));
	}
	let n = () => h(t);
	return N([
		e.currentIndex,
		e.stepIndex,
		e.contentVersion
	], n, { flush: "post" }), n(), {
		run: t,
		schedule: n
	};
}
//#endregion
//#region src/components/SpStepManager.vue
var At = /* @__PURE__ */ f({
	__name: "SpStepManager",
	setup(e) {
		let t = T(null), n = p("stepIndex", { value: 0 }), r = p("contentVersion", { value: 0 }), i = p("animInstances", /* @__PURE__ */ new Set()), a = -1;
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
		return y(() => {
			h(() => d(c(), !0));
		}), N(n, (e) => {
			let t = c();
			t !== a && d(t, Math.abs(t - a) > 1 || a < 0);
		}), N(r, () => {
			a = -1, h(() => d(c(), !0));
		}), (e, n) => (S(), o("span", {
			ref_key: "rootEl",
			ref: t,
			style: { display: "none" }
		}, null, 512));
	}
}), jt = /* @__PURE__ */ f({
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
		C("slideNum", n(() => t.slide?.num)), C("animInstances", /* @__PURE__ */ new Set());
		let a = k(null);
		return N(() => [t.html, t.fixedStep], ([e, n]) => {
			if (!e) {
				a.value = null;
				return;
			}
			let r = n === void 0 ? "" : ` data-fixed-step="${n}"`, i = {
				"sp-step-manager": At,
				...t.components
			};
			a.value = f({
				template: `<div${r}>${e}<sp-step-manager /></div>`,
				components: i
			});
		}, { immediate: !0 }), (e, t) => (S(), o("div", { class: g(r.value) }, [(S(), i(O(a.value)))], 2));
	}
}), Mt = { class: "sp-dev-pane" }, Nt = { class: "sp-dev-header" }, Pt = { class: "sp-dev-section" }, Ft = {
	key: 0,
	class: "sp-dev-empty"
}, It = {
	key: 1,
	class: "sp-dev-table"
}, Lt = ["title"], Rt = { class: "sp-dev-num" }, zt = { class: "sp-dev-num" }, Bt = ["onClick"], Vt = ["disabled"], Ht = { class: "sp-dev-section" }, Ut = ["title"], Wt = { class: "sp-dev-section sp-dev-config" }, Gt = { class: "sp-dev-config-fields" }, Kt = { class: "sp-dev-config-label" }, qt = {
	key: 0,
	class: "sp-dev-choice-group"
}, Jt = ["onClick"], Yt = ["checked", "onChange"], Xt = [
	"min",
	"max",
	"step",
	"value",
	"onInput"
], Zt = ["value", "onInput"], Qt = /* @__PURE__ */ f({
	__name: "SpDevPane",
	props: {
		visible: { type: Boolean },
		exportFn: { type: Function }
	},
	emits: ["close"],
	setup(r, { emit: c }) {
		let u = xt(), d = n(() => {
			let e = {};
			for (let t of Object.keys(u)) e[t] = u[t];
			return JSON.stringify(e, null, 1);
		}), f = {
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
		}, m = n(() => Object.keys(u).filter((e) => e !== "proMode" || u.proMode).map((e) => f[e] ?? {
			key: e,
			type: "string"
		})), h = p("liveUpdatesCount", T(0)), _ = T(0), v = null, x = n(() => {
			let e = _.value / 9;
			return e >= 1 ? "done" : e > .66 ? "warm" : e > .33 ? "mid" : "cool";
		});
		function C() {
			if (_.value++, v && clearTimeout(v), _.value >= 9) {
				u.proMode = !0, v = setTimeout(() => {
					_.value = 0;
				}, 1200);
				return;
			}
			v = setTimeout(() => {
				_.value = 0;
			}, 2e3);
		}
		let w = r, D = T(We()), O = null;
		function k() {
			M(), O = setInterval(() => {
				D.value = We();
			}, 1e3);
		}
		function M() {
			O !== null && (clearInterval(O), O = null);
		}
		N(() => w.visible, (e) => {
			e ? (D.value = We(), k()) : M();
		}), y(() => {
			w.visible && k();
		}), b(M);
		function ee() {
			qe(), D.value = We();
		}
		function te(e) {
			Je(e), D.value = We();
		}
		function ne() {
			w.exportFn?.();
		}
		function re() {
			St();
		}
		function P(e) {
			return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(1) + " MB";
		}
		function ie(e) {
			if (!e) return "—";
			let t = new Date(e);
			return t.toLocaleTimeString() + " " + t.toLocaleDateString();
		}
		return (n, c) => (S(), i(t, { to: "body" }, [r.visible ? (S(), o("div", {
			key: 0,
			class: "sp-dev-overlay",
			onClick: c[1] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", Mt, [
			s("div", Nt, [s("h2", { onClick: C }, [c[2] ||= l(" Dev Tools ", -1), _.value > 0 ? (S(), o("span", {
				key: 0,
				class: g(["sp-dev-title-clicks", x.value])
			}, A(_.value) + "/9", 3)) : a("", !0)]), s("button", {
				class: "sp-dev-close",
				onClick: c[0] ||= (e) => n.$emit("close"),
				"aria-label": "Close"
			}, "×")]),
			s("section", Pt, [
				s("h3", null, "Live Updates (" + A(j(h)) + ")", 1),
				s("h3", null, "Cache (" + A(D.value.length) + " entries)", 1),
				D.value.length === 0 ? (S(), o("div", Ft, "No cached entries")) : (S(), o("table", It, [c[3] ||= s("thead", null, [s("tr", null, [
					s("th", null, "Path"),
					s("th", null, "Size"),
					s("th", null, "Fetched"),
					s("th", null, "Type"),
					s("th")
				])], -1), s("tbody", null, [(S(!0), o(e, null, E(D.value, (e) => (S(), o("tr", { key: e.path + e.type }, [
					s("td", {
						class: "sp-dev-path",
						title: e.path
					}, A(e.path), 9, Lt),
					s("td", Rt, A(P(e.size)), 1),
					s("td", zt, A(ie(e.timestamp)), 1),
					s("td", null, A(e.type), 1),
					s("td", null, [s("button", {
						class: "sp-dev-del",
						onClick: (t) => te(e.path),
						title: "Remove entry"
					}, "×", 8, Bt)])
				]))), 128))])])),
				s("button", {
					class: "sp-dev-btn",
					onClick: ee,
					disabled: D.value.length === 0
				}, " Clear Cache ", 8, Vt)
			]),
			s("section", Ht, [
				c[4] ||= s("h3", null, "Actions", -1),
				s("button", {
					class: "sp-dev-btn",
					onClick: ne
				}, "Export Standalone"),
				s("button", {
					class: "sp-dev-btn",
					onClick: re,
					title: d.value
				}, "Clear localStorage Keys", 8, Ut)
			]),
			s("details", Wt, [c[5] ||= s("summary", null, [s("h3", null, "Config")], -1), s("div", Gt, [(S(!0), o(e, null, E(m.value, (t) => (S(), o("label", {
				key: t.key,
				class: "sp-dev-config-field"
			}, [s("span", Kt, A(t.key), 1), t.type === "choice" ? (S(), o("span", qt, [(S(!0), o(e, null, E(t.choices, (e) => (S(), o("button", {
				key: e,
				class: g(["sp-dev-choice-btn", { active: j(u)[t.key] === e }]),
				onClick: (n) => j(u)[t.key] = e
			}, A(e), 11, Jt))), 128))])) : t.type === "boolean" ? (S(), o("input", {
				key: 1,
				type: "checkbox",
				checked: !!j(u)[t.key],
				onChange: (e) => j(u)[t.key] = e.target.checked
			}, null, 40, Yt)) : t.type === "number" ? (S(), o("input", {
				key: 2,
				type: "range",
				min: t.min ?? 0,
				max: t.max ?? 1,
				step: t.step ?? .01,
				value: j(u)[t.key],
				onInput: (e) => j(u)[t.key] = parseFloat(e.target.value)
			}, null, 40, Xt)) : (S(), o("input", {
				key: 3,
				type: "text",
				value: j(u)[t.key],
				onInput: (e) => j(u)[t.key] = e.target.value
			}, null, 40, Zt))]))), 128))])]),
			c[6] ||= s("footer", { class: "sp-dev-footer" }, [s("small", null, "toolbar ◆ to open")], -1)
		])])) : a("", !0)]));
	}
});
//#endregion
//#region src/composables/useElementScale.ts
function $t(e, t, r) {
	let i = T(0), a = T(0), o = null;
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
	return y(() => {
		s(), e.value && (o = new ResizeObserver(() => {
			s();
		}), o.observe(e.value));
	}), b(() => {
		o?.disconnect();
	}), { transformStyle: l };
}
//#endregion
//#region src/components/SpPresenterView.vue?vue&type=script&setup=true&lang.ts
var en = { class: "sp-presenter-main" }, tn = { class: "sp-presenter-sidebar" }, nn = { class: "sp-presenter-info" }, rn = { class: "sp-presenter-num" }, an = { class: "sp-presenter-progress" }, on = ["title"], sn = { class: "sp-presenter-clock-time" }, cn = {
	key: 0,
	class: "sp-presenter-clock-feedback"
}, ln = { class: "sp-presenter-notes" }, un = ["innerHTML"], dn = "sp-presentation-clock", fn = "sp-presentation-log", pn = /* @__PURE__ */ f({
	__name: "SpPresenterView",
	props: {
		current: {},
		currentIndex: {},
		total: {},
		activeHtml: {},
		progressPercent: {},
		blackout: { type: Boolean },
		exitBlackout: { type: Function },
		components: {},
		designWidth: {},
		designHeight: {},
		config: {},
		slides: {}
	},
	setup(e) {
		let t = e, r = p("stepIndex"), c = T(null), u = T(null), { transformStyle: d } = $t(c, t.designWidth, t.designHeight), { transformStyle: f } = $t(u, t.designWidth, t.designHeight), m = T(280), h = !1;
		function g(e) {
			h = !0, document.addEventListener("mousemove", _), document.addEventListener("mouseup", x), e.preventDefault();
		}
		function _(e) {
			if (!h) return;
			let t = window.innerWidth - e.clientX;
			m.value = Math.max(160, Math.min(600, t));
		}
		function x() {
			h = !1, document.removeEventListener("mousemove", _), document.removeEventListener("mouseup", x);
		}
		let C = n(() => ({ gridTemplateColumns: `1fr 6px ${m.value}px` })), w = T(260), E = !1;
		function D(e) {
			E = !0, document.addEventListener("mousemove", O), document.addEventListener("mouseup", k), e.preventDefault();
		}
		function O(e) {
			if (!E) return;
			let t = window.innerHeight - e.clientY;
			w.value = Math.max(120, Math.min(600, t));
		}
		function k() {
			E = !1, document.removeEventListener("mousemove", O), document.removeEventListener("mouseup", k);
		}
		let M = n(() => {
			let e = t.current;
			return e?.notes ? e.notes : "No notes";
		}), ee = n(() => t.currentIndex >= t.total - 1 ? null : t.slides[t.currentIndex + 1] ?? null), te = n(() => Ae(ee.value)), ne = n(() => te.value?.html ?? ""), re = n(() => te.value?.steps ?? 0);
		function P() {
			try {
				let e = localStorage.getItem(dn);
				return e ? JSON.parse(e) : Date.now();
			} catch {
				return Date.now();
			}
		}
		function F() {
			try {
				localStorage.setItem(dn, JSON.stringify(R.value));
			} catch {}
		}
		function ie() {
			try {
				let e = localStorage.getItem(fn);
				return e ? JSON.parse(e) : [];
			} catch {
				return [];
			}
		}
		function I() {
			try {
				localStorage.setItem(fn, JSON.stringify(L.value));
			} catch {}
		}
		let L = T(ie()), R = T(P()), z = T(Date.now()), ae = null, B = n(() => {
			let e = Math.floor((z.value - R.value) / 1e3), t = Math.floor(e / 60), n = e % 60;
			return `${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
		}), oe = n(() => {
			let e = L.value.length;
			return e ? `${e} entries logged` : "";
		});
		function se(e) {
			let n = t.slides[e];
			if (!n) return;
			let r;
			if (n.html) {
				let e = document.createElement("div");
				e.innerHTML = n.html, r = e.querySelector("h1,h2,h3")?.textContent?.trim() || void 0;
			}
			let i = Math.floor((Date.now() - R.value) / 1e3);
			L.value.push({
				slide: e + 1,
				elapsed: i,
				heading: r
			}), I();
		}
		function V(e, t) {
			let n = Math.floor((Date.now() - R.value) / 1e3);
			L.value.push({
				slide: e + 1,
				elapsed: n,
				step: t + 1
			}), I();
		}
		function ce() {
			confirm("Reset timer and clear slide log?") && (R.value = Date.now(), z.value = Date.now(), L.value = [], F(), I(), le("Reset"));
		}
		function H() {
			let e = new Date(R.value).toLocaleString(), t = ["slide,elapsed_sec,heading"];
			t.push(`0,0,"Started: ${e}"`);
			for (let e of L.value) {
				let n = e.heading ? `"${e.heading.replace(/"/g, "\"\"")}"` : "", r = e.step === void 0 ? String(e.slide) : `${e.slide}.${String(e.step).padStart(2, "0")}`;
				t.push(`${r},${e.elapsed},${n}`);
			}
			let n = t.join("\n");
			navigator.clipboard.writeText(n).catch(() => {});
			let r = new Blob([n], { type: "text/csv;charset=utf-8;" }), i = URL.createObjectURL(r), a = document.createElement("a");
			a.href = i, a.download = `slides-log-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, a.click(), URL.revokeObjectURL(i), le("Copied + Downloaded");
		}
		let U = T(""), W = null;
		function le(e) {
			U.value = e, W && clearTimeout(W), W = setTimeout(() => {
				U.value = "";
			}, 1500);
		}
		return N(() => [r.value, t.currentIndex], ([e, n], [r, i]) => {
			e === r ? t.config.logSteps && n !== i && V(e, n) : se(e);
		}), y(() => {
			R.value = P(), F(), z.value = Date.now(), ae = setInterval(() => {
				z.value = Date.now();
			}, 1e3), se(t.currentIndex);
		}), b(() => {
			ae && clearInterval(ae), x(), k();
		}), (t, n) => (S(), o("div", {
			class: "sp-presenter-layout",
			style: v(C.value)
		}, [
			s("div", en, [
				s("div", {
					class: "sp-presenter-preview",
					ref_key: "previewContainerEl",
					ref: c
				}, [s("div", {
					style: v(j(d)),
					class: "sp-slide-scaler"
				}, [e.current ? (S(), i(jt, {
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
					style: v({ height: w.value + "px" })
				}, [n[1] ||= s("div", { class: "sp-presenter-next-label" }, "Next", -1), s("div", {
					class: "sp-presenter-next-slide-wrap",
					ref_key: "nextContainerEl",
					ref: u
				}, [s("div", {
					style: v(j(f)),
					class: "sp-slide-scaler"
				}, [ee.value ? (S(), i(jt, {
					key: "next-" + (e.currentIndex + 1),
					slide: ee.value,
					html: ne.value,
					fixedStep: re.value - 1,
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
			s("div", tn, [s("div", nn, [
				s("div", rn, [l(A(e.currentIndex + 1) + " ", 1), s("small", null, "/ " + A(e.total), 1)]),
				s("div", an, [s("div", {
					class: "sp-presenter-progress-bar",
					style: v({ width: e.progressPercent + "%" })
				}, null, 4)]),
				s("div", {
					class: "sp-presenter-clock",
					title: oe.value
				}, [
					s("span", sn, A(B.value), 1),
					U.value ? (S(), o("span", cn, A(U.value), 1)) : a("", !0),
					s("span", { class: "sp-presenter-clock-actions" }, [s("button", {
						class: "sp-presenter-clock-btn",
						title: "Export log (CSV)",
						onClick: H
					}, "⬇"), s("button", {
						class: "sp-presenter-clock-btn",
						title: "Reset timer",
						onClick: ce
					}, "↺")])
				], 8, on),
				e.blackout ? (S(), o("div", {
					key: 0,
					class: "sp-presenter-blackout-badge",
					onClick: n[0] ||= (...t) => e.exitBlackout && e.exitBlackout(...t)
				}, "BLACKED OUT")) : a("", !0)
			]), s("div", ln, [n[2] ||= s("h3", null, "Speaker Notes", -1), s("div", {
				class: "sp-presenter-notes-content",
				innerHTML: M.value
			}, null, 8, un)])])
		], 4));
	}
}), mn = { class: "sp-print" }, hn = { class: "sp-overview-thumb-num" }, gn = /* @__PURE__ */ f({
	__name: "SpPrintView",
	props: {
		steps: { type: Boolean },
		components: {},
		designWidth: {},
		designHeight: {},
		config: {},
		slides: {}
	},
	setup(t) {
		let r = t, a = n(() => r.slides.map((e) => Ae(e))), l = n(() => ({
			width: `${r.designWidth}px`,
			height: `${r.designHeight}px`
		})), d = n(() => `
@page {
  size: ${r.designWidth}px ${r.designHeight}px;
}
`), f = n(() => r.steps ? r.slides.flatMap((e, t) => {
			let n = a.value[t].steps;
			return [...Array(n).keys()].map((n) => ({
				step: n,
				slide: e,
				slideI: t,
				html: a.value[t].html
			}));
		}) : r.slides.map((e, t) => ({
			slide: e,
			slideI: t,
			html: a.value[t].html,
			step: a.value[t].steps - 1
		})));
		return N(f, () => {
			console.log(f.value.length, f.value);
		}), (n, r) => (S(), o("div", mn, [
			r[0] ||= c("<div class=\"sp-print-helper-container\"><div class=\"sp-print-helper\"><p>To export as PDF:</p><ul><li><kbd>Ctrl</kbd> + <kbd>P</kbd> (open the print dialog)</li><li>Select &quot;Save as/to PDF&quot; (or similar)</li><li>Select &quot;Margins&quot; as &quot;None&quot;</li><li><input type=\"checkbox\" checked disabled> Check &quot;Print backgrounds&quot; </li><li><input type=\"checkbox\" disabled> Uncheck &quot;Print headers and footers&quot; </li><li>Click &quot;Save&quot;</li></ul><p><label>Dismiss this dialog! (reload to get back)<input type=\"checkbox\"></label></p></div></div>", 1),
			(S(!0), o(e, null, E(f.value, ({ slide: e, slideI: n, html: r, step: i }, a) => (S(), o("div", {
				key: a,
				class: "sp-print-wrapper",
				style: v(l.value)
			}, [u(jt, {
				slide: e,
				style: v(l.value),
				html: r,
				fixedStep: i,
				components: t.components
			}, null, 8, [
				"slide",
				"style",
				"html",
				"fixedStep",
				"components"
			]), s("div", hn, A(n + 1), 1)], 4))), 128)),
			(S(), i(O("style"), { innerHTML: d.value }, null, 8, ["innerHTML"]))
		]));
	}
}), _n = { class: "sp-overview-grid" }, vn = ["onClick"], yn = { class: "sp-overview-thumb-stage" }, bn = { class: "sp-overview-thumb-num" }, xn = /* @__PURE__ */ f({
	__name: "SpOverview",
	props: {
		slides: {},
		currentIndex: {},
		slideHeadingLevels: {},
		overviewThumbStyle: {},
		overviewSlideStyle: {},
		components: {}
	},
	emits: ["close", "select"],
	setup(t) {
		let r = t, i = n(() => r.slides.map((e) => Ae(e)));
		return (n, r) => (S(), o("div", {
			class: "sp-overview",
			onClick: r[0] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", _n, [(S(!0), o(e, null, E(t.slides, (e, r) => (S(), o("div", {
			key: r,
			class: g(["sp-overview-thumb", {
				active: r === t.currentIndex,
				"sp-overview-h1": t.slideHeadingLevels[r] === 1,
				"sp-overview-h2": t.slideHeadingLevels[r] === 2,
				"sp-overview-h3": t.slideHeadingLevels[r] === 3
			}]),
			style: v(t.overviewThumbStyle),
			onClick: (e) => n.$emit("select", r)
		}, [s("div", yn, [s("div", { style: v(t.overviewSlideStyle) }, [u(jt, {
			slide: e,
			html: i.value[r].html,
			fixedStep: i.value[r].steps - 1,
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"fixedStep",
			"components"
		])], 4)]), s("div", bn, A(r + 1), 1)], 14, vn))), 128))])]));
	}
}), Sn = { class: "sp-go-prompt-box" }, Cn = ["onKeydown"], wn = {
	key: 0,
	class: "sp-go-results"
}, Tn = ["onClick", "onMouseenter"], En = { class: "sp-go-result-thumb" }, Dn = { class: "sp-go-result-text" }, On = { class: "sp-go-result-num" }, kn = ["innerHTML"], An = {
	key: 1,
	class: "sp-go-no-results"
}, jn = /* @__PURE__ */ f({
	__name: "SpGoPrompt",
	props: {
		slides: {},
		designWidth: {},
		designHeight: {},
		components: {},
		total: {}
	},
	emits: ["close", "select"],
	setup(t, { emit: r }) {
		let i = t, c = r, l = n(() => i.slides.map((e) => Ae(e))), d = T(""), f = T(0), p = T(null), m = n(() => i.slides.map((e, t) => {
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
		})), _ = n(() => {
			let e = d.value.trim().toLowerCase();
			if (!e || /^\d+$/.test(e)) return [];
			let t = [];
			for (let n of m.value) {
				let r = [];
				for (let t of n.texts) t.toLowerCase().includes(e) && r.push(t);
				r.length && t.push({
					index: n.index,
					matches: r
				});
			}
			return t;
		});
		N(_, () => {
			f.value = 0;
		});
		let b = n(() => ({
			transform: `scale(${210 / i.designWidth})`,
			transformOrigin: "top left",
			width: i.designWidth + "px",
			height: i.designHeight + "px"
		}));
		function x(e) {
			let t = d.value.trim();
			if (!t) return C(e);
			let n = e.toLowerCase(), r = t.toLowerCase(), i = [], a = 0;
			for (; a < e.length;) {
				let o = n.indexOf(r, a);
				if (o === -1) {
					i.push(C(e.slice(a)));
					break;
				}
				i.push(C(e.slice(a, o))), i.push("<mark>" + C(e.slice(o, o + t.length)) + "</mark>"), a = o + t.length;
			}
			return i.join("");
		}
		function C(e) {
			return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		}
		function w() {
			f.value < _.value.length - 1 && f.value++;
		}
		function D() {
			f.value > 0 && f.value--;
		}
		function O() {
			let e = d.value.trim();
			if (e) {
				if (/^\d+$/.test(e)) {
					let t = parseInt(e, 10);
					t >= 1 && t <= i.total && c("select", t - 1);
					return;
				}
				if (_.value.length > 0) {
					let e = _.value[f.value]?.index ?? _.value[0].index;
					c("select", e);
				}
			}
		}
		function k(e) {
			c("select", e);
		}
		return y(() => {
			h(() => p.value?.focus());
		}), (n, r) => (S(), o("div", {
			class: "sp-go-prompt",
			onClick: r[2] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", Sn, [re(s("input", {
			ref_key: "goPromptInput",
			ref: p,
			"onUpdate:modelValue": r[0] ||= (e) => d.value = e,
			class: "sp-go-prompt-input",
			placeholder: "slide number or search text…",
			onKeydown: [
				P(O, ["enter"]),
				r[1] ||= P((e) => n.$emit("close"), ["escape"]),
				P(F(w, ["prevent"]), ["down"]),
				P(F(D, ["prevent"]), ["up"])
			]
		}, null, 40, Cn), [[ee, d.value]]), _.value.length ? (S(), o("div", wn, [(S(!0), o(e, null, E(_.value, (n, r) => (S(), o("div", {
			key: n.index,
			class: g(["sp-go-result", { focused: r === f.value }]),
			onClick: (e) => k(n.index),
			onMouseenter: (e) => f.value = r
		}, [s("div", En, [s("div", { style: v(b.value) }, [u(jt, {
			slide: t.slides[n.index],
			html: l.value[n.index].html,
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"components"
		])], 4)]), s("div", Dn, [s("div", On, "Slide " + A(n.index + 1), 1), (S(!0), o(e, null, E(n.matches, (e, t) => (S(), o("div", {
			key: t,
			class: "sp-go-result-heading",
			innerHTML: x(e)
		}, null, 8, kn))), 128))])], 42, Tn))), 128))])) : d.value && !/^\d*$/.test(d.value) ? (S(), o("div", An, " No slides match \"" + A(d.value) + "\" ", 1)) : a("", !0)])]));
	}
});
//#endregion
//#region src/export.ts
async function Mn() {
	let e = document.getElementById("sp-content");
	if (!e) throw Error("Export failed: #sp-content not found");
	let t = e.textContent?.trim() || "";
	t = Se(t);
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
	document.querySelectorAll("head style").forEach((e) => {
		H.has(e) || e.hasAttribute("data-vite-dev-id") || r.push(e.textContent ?? "");
	});
	let a = `<template id="sp-cache">${He().replace(/</g, "&lt;")}</template>`, o = document.getElementById("sp-init")?.outerHTML ?? "", s = {};
	for (let [e, t] of Object.entries(ce)) t != null && (s[e] = t);
	let c = JSON.stringify(s, null, 2).replace(/"([^"]+)":/g, "$1:"), l = Array.from(document.documentElement.classList).find((e) => e.startsWith("theme-")) ?? "", u = `<!DOCTYPE html>
<html lang="en"${l ? ` class="${l}"` : ""}>
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
${o}
<script src="./slides-purryst.bundle.js"><\/script>
<script>
(async () => { await SlidesPurryst.createSlidesPurryst(${c}) })()
<\/script>
</body>
</html>`, d = new Blob([u], { type: "text/html" }), f = URL.createObjectURL(d), p = document.createElement("a");
	p.href = f, p.download = "presentation-standalone.html", document.body.appendChild(p), p.click(), document.body.removeChild(p), URL.revokeObjectURL(f);
}
//#endregion
//#region src/composables/useCodeHighlight.ts
var Nn = null, Pn = null;
async function Fn() {
	if (!Nn) return Pn || (Pn = (async () => {
		try {
			let { createHighlighter: e } = await import("shiki");
			Nn = await e({
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
			Nn = null;
		}
	})(), Pn);
}
function In(e) {
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
async function Ln(e) {
	if (await Fn(), !Nn) return e;
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.querySelectorAll("pre");
	for (let e of n) {
		let t = e.querySelector("code");
		if (!t) continue;
		let n = In(t);
		if (!n) continue;
		let r = t.textContent || "";
		try {
			e.outerHTML = Nn.codeToHtml(r, {
				lang: n,
				theme: "dark-plus"
			});
		} catch {}
	}
	return t.innerHTML;
}
//#endregion
//#region src/composables/useChunklets.ts
function Rn(e) {
	let t = [], n = /<sp-chunk\b([^>]*)>([\s\S]*?)<\/sp-chunk>/gi, r;
	for (; (r = n.exec(e)) !== null;) {
		let e = r[1], n = /name="([^"]*)"/.exec(e)?.[1];
		if (!n) continue;
		let i = (/params="([^"]*)"/.exec(e)?.[1] || "").split(",").map((e) => e.trim()).filter(Boolean), a = r[2].replace(/^\s*\n/m, "").replace(/\n\s*$/m, "");
		if (!a) continue;
		let o = /data-kind="([^"]*)"/.exec(e)?.[1] === "typst" ? "typst" : "html";
		t.push({
			name: n,
			params: i,
			html: a,
			kind: o
		});
	}
	return t;
}
function zn(e) {
	let t = [];
	return e.querySelectorAll("sp-chunk").forEach((e) => {
		let n = e.getAttribute("name");
		if (!n) return;
		let r = (e.getAttribute("params") || "").split(",").map((e) => e.trim()).filter(Boolean), i = e.innerHTML.replace(/^\s*\n/m, "").replace(/\n\s*$/m, "");
		if (!i) return;
		let a = e.getAttribute("data-kind") === "typst" ? "typst" : "html";
		t.push({
			name: n,
			params: r,
			html: i,
			kind: a
		});
	}), t;
}
function Bn(e, t) {
	return e.replace(/\$(\w+)/g, (e, n) => n in t ? String(t[n]) : `$${n}`);
}
function Vn(e) {
	if (e.params.length === 0) return "instant";
	let t = e.params.includes("w"), n = e.params.includes("h");
	return t || n ? "drag" : "click";
}
function Hn() {
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
var Un = ["data-source-file-push"], Wn = { class: "sp-global-error" }, Gn = {
	key: 0,
	class: "sp-loading"
}, Kn = { class: "sp-global-top" }, qn = { class: "sp-global-bottom" }, Jn = { class: "sp-slide-footer" }, Yn = { class: "sp-chunklet-hint" }, Xn = { class: "sp-nav-bar" }, Zn = ["title"], Qn = ["disabled"], $n = ["disabled"], er = {
	key: 0,
	class: "sp-nav-more-menu"
}, tr = { class: "sp-nav-more-icon" }, nr = { class: "sp-nav-more-item sp-nav-more-browse" }, rr = { class: "sp-nav-pills" }, ir = {
	key: 0,
	class: "sp-nav-pill-ellipsis"
}, ar = ["onClick", "aria-label"], or = {
	key: 1,
	class: "sp-chunklets-bar"
}, sr = ["onClick"], cr = { class: "sp-chunklets-bar-badge" }, lr = { class: "sp-progress" }, ur = /* @__PURE__ */ f({
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
		print: {
			type: [Boolean, String],
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
		let c = t, d = n(() => c.print === "slides" ? "print-slides" : c.print === "steps" ? "print-steps" : c.presenter ? "presenter" : "main"), { slides: p, currentIndex: m, current: _, total: w, goTo: M, nextSlide: ee, prevSlide: P, setSlides: ie } = se(c.slides), { stepIndex: I, totalSteps: L, isFirstStep: R, isLastStep: z, nextStep: ae, prevStep: ce } = ke(), H = !1, U = null, W = T(0), le = k(null), ue = k(null);
		N(() => c.raw?.before, (e) => {
			if (!e) {
				le.value = null;
				return;
			}
			le.value = f({
				template: `<div style="display:contents" class="sp-raw-before">${e}</div>`,
				components: c.components
			});
		}, { immediate: !0 }), N(() => c.raw?.after, (e) => {
			if (!e) {
				ue.value = null;
				return;
			}
			ue.value = f({
				template: `<div style="display:contents" class="sp-raw-after">${e}</div>`,
				components: c.components
			});
		}, { immediate: !0 });
		let { openPresenterWindow: de, closePresenter: fe, presenterActive: pe, syncState: me, syncBlackout: G, send: he, onMessage: q, channel: ve } = ht(), { transformStyle: ye, containerStyle: be } = gt(c.designWidth, c.designHeight), xe = T(null), J = T(null);
		kt({
			getSlideEl: () => J.value?.querySelector(".sp-slide-current") ?? null,
			currentIndex: m,
			stepIndex: I,
			contentVersion: W
		}), C("stepIndex", I), C("slideIndex", m), C("contentVersion", W), C("slides", p), C("goTo", M), C("sp-components", c.components);
		let Y = T(c.rawSlideSources ?? p.value.map((e) => e.html));
		C("rawSlideSources", Y);
		let Te = T(1), Ee = T(!1), De = n(() => window.location.pathname);
		N(m, (e, t) => {
			e !== t && (Te.value = e > t ? 1 : -1, Ee.value = !0);
		});
		let X = n(() => {
			let e = _.value?.transition ?? c.transition;
			return e === "" ? "none" : e;
		}), je = n(() => {
			let e = `sp-${X.value}`;
			return X.value === "none" ? e : `${e} sp-dir-${Te.value === 1 ? "forward" : "backward"}`;
		}), Me = n(() => X.value === "none" ? 0 : _.value?.transitionDuration ?? c.transitionDuration), Ne = n(() => ({
			"--sp-design-width": `${c.designWidth}px`,
			"--sp-design-height": `${c.designHeight}px`,
			"--sp-transition-duration": `${Me.value}ms`
		}));
		x(() => {
			X.value === "none" || !Ee.value || !J.value || (Ee.value = !1, J.value.classList.add("sp-swapping"), J.value.offsetHeight, J.value.classList.remove("sp-swapping"));
		});
		let Pe = n(() => m.value === 0), Fe = n(() => m.value === w.value - 1), Ie = n(() => w.value === 0 ? 0 : (m.value + 1) / w.value * 100), Z = n(() => {
			let e = ze.value;
			if (e <= 23) return Array.from({ length: e }, (e, t) => ({
				type: "pill",
				index: t
			}));
			let t = [], n = m.value, r = Math.max(5, n - 5), i = Math.min(e - 1 - 5, n + 5);
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
		}), Le = n(() => {
			let e = p.value.map((e, t) => e.fakeEnd ? t : -1).filter((e) => e >= 0), t = w.value - 1;
			return t >= 0 && !e.includes(t) && e.push(t), e.sort((e, t) => e - t);
		}), Re = n(() => Le.value.find((e) => e >= m.value) ?? w.value - 1), ze = n(() => Re.value + 1), Be = n(() => Ae(_.value)), Ve = n(() => Be.value?.html ?? "");
		function He() {
			z.value ? m.value < w.value - 1 && ee() : ae();
		}
		function Ue() {
			R.value ? m.value > 0 && P() : ce();
		}
		let We = n(() => m.value === 0 ? null : p.value[m.value - 1] ?? null), Ge = n(() => Ae(We.value)), Ke = n(() => Ge?.value?.html ?? ""), qe = n(() => Ge?.value?.steps ?? ""), Je = n(() => m.value >= w.value - 1 ? null : p.value[m.value + 1] ?? null), Ye = n(() => Ae(Je.value)), Xe = n(() => Ye?.value?.html ?? "");
		n(() => Ye?.value?.steps ?? "");
		function Ze() {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}
		function $e() {
			pe.value ? fe() : de();
		}
		let Q = xt();
		V.config = Q;
		let et = T(!1), tt = T(!1), $ = T(!1), nt = T(!0), rt = T(!1), it = T(null);
		function at(e) {
			let t = document.documentElement;
			e === "auto" ? t.removeAttribute("data-dark-mode") : t.dataset.darkMode = e;
		}
		function ot() {
			Q.darkMode = Q.darkMode === "dark" ? "light" : "dark";
		}
		let st = n(() => Q.darkMode === "dark" ? "Dark" : "Light"), ct = n(() => Q.darkMode === "dark" ? "●" : "○");
		N(() => Q.darkMode, at, { immediate: !0 }), ne(() => {
			V.navLocked = Q.navLocked, V.currentIndex = m.value, V.stepIndex = I.value, V.total = w.value, V.effectiveLast = Re.value, V.effectiveTotal = ze.value, V.fakeEndIndices = Le.value;
		}), V.toggleNavLock = () => {
			Q.navLocked = !Q.navLocked;
		}, V.goTo = M, V.next = He, V.prev = Ue, V.nextSlide = ee, V.prevSlide = P, V.export = Mn;
		let lt = n(() => ({
			width: c.designWidth * Q.overviewScale + "px",
			height: c.designHeight * Q.overviewScale + "px"
		})), ut = n(() => ({
			transform: `scale(${Q.overviewScale})`,
			transformOrigin: "top left",
			width: c.designWidth + "px",
			height: c.designHeight + "px"
		})), dt = n(() => p.value.map((e) => {
			let t = document.createElement("div");
			t.innerHTML = e.html;
			let n = t.querySelector("h1,h2,h3");
			return n ? parseInt(n.tagName[1]) : 0;
		}));
		function ft(e) {
			et.value = !1, U = 0, M(e);
		}
		let pt = T(!1);
		function _t() {
			pt.value = !0;
		}
		function vt() {
			pt.value = !1;
		}
		function yt(e) {
			vt(), M(e);
		}
		N(_, (e, t) => {
			L.value = Oe(e.html).steps, t?.num !== e?.num && (U === null ? H ? (I.value = Math.min(Math.max(I.value, 0), Math.max(0, L.value - 1)), H = !1) : Te.value === -1 ? I.value = Math.max(0, L.value - 1) : I.value = 0 : (I.value = Math.min(Math.max(U, 0), Math.max(0, L.value - 1)), U = null));
		});
		let bt = T(!1);
		N([m, I], () => {
			bt.value || me(m.value, I.value);
		}, { flush: "post" }), N([m, I], () => {
			c.presenter || St();
		}, { flush: "post" });
		function St() {
			let e = `#${m.value}/${I.value}`;
			history.replaceState(null, "", e);
		}
		function Ct() {
			let e = location.hash.match(/^#(\d+)(?:\/(\d+))?$/);
			if (!e) return;
			let t = parseInt(e[1], 10), n = e[2] === void 0 ? 0 : parseInt(e[2], 10);
			t >= 0 && t < w.value && (t !== m.value && (H = !0), M(t), I.value = n);
		}
		function wt() {
			Ct();
		}
		q("sync", (e) => {
			bt.value = !0, e.slide !== m.value && (H = !0), M(e.slide), I.value = e.step, h(() => {
				bt.value = !1;
			});
		}), q("presenter-ready", () => {
			me(m.value, I.value);
		}), q("presenter-close", () => {
			fe();
		}), q("blackout", (e) => {
			$.value = e.active;
		}), c.presenter && (he("presenter-ready"), window.addEventListener("beforeunload", () => {
			he("presenter-close");
		}));
		function Tt() {
			$.value = !$.value, G($.value);
		}
		function Et() {
			$.value && ($.value = !1, G(!1));
		}
		let Dt = [...K._keymapSetups];
		K.applyAnimRegistrations();
		let { rebuildKeymap: Ot } = mt({
			next: He,
			prev: Ue,
			goTo: M,
			goToPrevBegin: Nt,
			goToNextBegin: Ft,
			goToPrevEnd: Pt,
			goToNextEnd: It,
			currentIndex: m,
			current: _,
			total: w,
			nextStep: ae,
			prevStep: ce,
			stepIndex: I,
			totalSteps: L,
			isLastStep: z,
			isFirstStep: R,
			onPresenterToggle: $e,
			onOverviewToggle: () => et.value = !et.value,
			onOverviewExit: () => {
				et.value = !1;
			},
			onGoPrompt: _t,
			onBlackoutToggle: Tt,
			onBlackoutExit: Et,
			onDevPaneToggle: () => {
				Q.proMode ? Lt() : ot();
			},
			onChunkBarToggle: Ut
		}, {
			getContext: () => ({
				overview: et.value,
				presenter: pe.value,
				blackout: $.value,
				devPane: tt.value,
				dragging: V.dragging,
				goPrompt: pt.value
			}),
			extraSetups: Dt
		});
		y(() => {
			_.value && (L.value = Oe(_.value.html).steps), c.presenter ? nt.value = !1 : (Ct(), h(() => {
				St(), nt.value = !1;
			}), window.addEventListener("hashchange", wt)), document.addEventListener("click", Rt, !0), At(c.seed), Mt();
		});
		function At(e) {
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
		async function Mt() {
			for (let e = 0; e < p.value.length; e++) {
				let t = p.value[e], n = await Ln(t.html);
				n !== t.html && (p.value[e] = {
					...t,
					html: n
				});
			}
		}
		b(() => {
			document.removeEventListener("click", Rt, !0), window.removeEventListener("hashchange", wt), window.removeEventListener("keydown", en);
		});
		function Nt() {
			I.value > 0 ? I.value = 0 : m.value > 0 && (U = 0, M(m.value - 1));
		}
		function Pt() {
			m.value > 0 && M(m.value - 1);
		}
		function Ft() {
			m.value < w.value - 1 && (U = 0, M(m.value + 1));
		}
		function It() {
			I.value < L.value - 1 ? I.value = Oe(p.value[m.value].html).steps - 1 : m.value < w.value - 1 && (U = Math.max(0, Oe(p.value[m.value + 1].html).steps - 1), M(m.value + 1));
		}
		function Lt() {
			tt.value = !tt.value;
		}
		function Rt(e) {
			rt.value && it.value && !it.value.contains(e.target) && (rt.value = !1);
		}
		let zt = n(() => {
			let e = V.selectedChunklet;
			return e ? Vn(e) : "click";
		});
		function Bt(e) {
			let t = e.currentTarget;
			if (!t) return {
				x: 0,
				y: 0
			};
			let n = t.getBoundingClientRect(), r = Hn();
			return {
				x: Math.round((e.clientX - n.left) / r),
				y: Math.round((e.clientY - n.top) / r)
			};
		}
		function Vt(e, t) {
			if (!e) return;
			let n = m.value, r = p.value[n];
			if (e.kind === "typst") {
				let i = Bn(e.html, t), a = `<div class="sp-chunklet-placeholder">chunklet: ${e.name}</div>`;
				p.value = p.value.map((e, t) => t === n ? {
					...e,
					html: e.html + "\n" + a
				} : e), Y.value[n] && (Y.value = Y.value.map((e, t) => t === n ? e + "\n" + a : e)), L.value = Oe(_.value.html).steps, W.value++, V.chunkletMode = !1, V.selectedChunklet = null, Wt(i, r.editableIndex, e, {
					file: r.sourceFile,
					sourceLine: r.sourceLine
				});
				return;
			}
			let i = Bn(e.html, t), a = r.html;
			p.value = p.value.map((e, t) => t === n ? {
				...e,
				html: a + "\n" + i
			} : e), Y.value[n] && (Y.value = Y.value.map((e, t) => t === n ? e + "\n" + i : e)), L.value = Oe(_.value.html).steps, W.value++, V.chunkletMode = !1, V.selectedChunklet = null, Wt(i, r.editableIndex);
		}
		function Ht(e) {
			if (V.selectedChunklet === e && V.chunkletMode) {
				$t();
				return;
			}
			V.selectedChunklet = e, V.chunkletMode = !0;
		}
		function Ut() {
			V.showChunkletsBar = !V.showChunkletsBar;
		}
		function Wt(e, t, n, r) {
			let i = J.value?.querySelector(".sp-slide-current");
			if (n?.kind === "typst") {
				let n = r?.file ?? null, i = r?.sourceLine == null ? null : String(r.sourceLine);
				n && i && fetch("/__sp_edit", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "insert-chunk",
						kind: "typst",
						src: e,
						file: n,
						sourceLine: i,
						editableIndex: t
					})
				}).catch(() => {});
				return;
			}
			let a = J.value?.querySelector(".sp-slide-current [data-source-file-push] + *") ?? i, o = i ? Qe(a) : null;
			fetch("/__sp_edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "insert-chunk",
					html: e,
					file: o,
					editableIndex: t
				})
			}).catch(() => {});
		}
		let Gt = T({
			x: 0,
			y: 0
		}), Kt = T({
			x: 0,
			y: 0
		}), qt = T(!1), Jt = n(() => {
			let e = Math.min(Gt.value.x, Kt.value.x), t = Math.min(Gt.value.y, Kt.value.y), n = Math.abs(Kt.value.x - Gt.value.x), r = Math.abs(Kt.value.y - Gt.value.y);
			return {
				left: e + "px",
				top: t + "px",
				width: n + "px",
				height: r + "px"
			};
		});
		function Yt(e) {
			e.preventDefault(), Gt.value = Bt(e), Kt.value = { ...Gt.value }, qt.value = !0;
		}
		function Xt(e) {
			qt.value && (Kt.value = Bt(e));
		}
		function Zt(e) {
			if (!qt.value) return;
			qt.value = !1;
			let t = V.selectedChunklet;
			if (!t) return;
			let n = Vn(t), r = Gt.value, i = Kt.value, a = Math.abs(i.x - r.x), o = Math.abs(i.y - r.y);
			n === "drag" && !(a < 5 && o < 5) ? Vt(t, {
				x: Math.min(r.x, i.x),
				y: Math.min(r.y, i.y),
				w: Math.abs(i.x - r.x),
				h: Math.abs(i.y - r.y)
			}) : Vt(t, {
				x: r.x,
				y: r.y
			});
		}
		function $t() {
			V.chunkletMode = !1, V.selectedChunklet = null, qt.value = !1;
		}
		N(() => V.chunkletMode, (e) => {
			e ? window.addEventListener("keydown", en) : window.removeEventListener("keydown", en);
		});
		function en(e) {
			e.key === "Escape" && $t();
		}
		function tn(e) {
			Y.value = oe(e);
			let t = we(Ce(Se(e))), n = document.createElement("div");
			n.innerHTML = t;
			let r = B(n);
			if (r.length === 0) return;
			let i = m.value, a = I.value, o = Math.min(i, r.length - 1);
			H = !0, ie(r), m.value = o, L.value = Oe(_.value.html).steps, o === i ? (I.value = Math.min(a, L.value - 1), H = !1) : I.value = 0, Mt().then(() => {
				W.value++;
			});
		}
		return r({ updateSlides: tn }), (n, r) => (S(), o("div", {
			class: g(["sp-presentation", { "sp-presenter-mode": t.presenter }]),
			style: v(Ne.value)
		}, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": De.value
			}, null, 8, Un),
			c.raw?.before ? (S(), i(O(le.value), { key: 0 })) : a("", !0),
			j(ge).length > 0 ? (S(), o("div", {
				key: 1,
				class: "sp-global-error-overlay",
				onClick: r[0] ||= F((e) => j(_e)(), ["self"])
			}, [s("div", Wn, [r[14] ||= s("h3", null, "Global Errors", -1), s("ul", null, [(S(!0), o(e, null, E(j(ge), (e, t) => (S(), o("li", { key: t }, A(e), 1))), 128))])])])) : a("", !0),
			d.value == "main" ? (S(), o(e, { key: 2 }, [
				nt.value ? (S(), o("div", Gn, [...r[15] ||= [s("div", { class: "sp-loading-text" }, "Loading…", -1)]])) : a("", !0),
				re(s("div", {
					class: "sp-viewport",
					style: v(j(be)),
					ref_key: "viewportEl",
					ref: xe
				}, [s("div", {
					class: "sp-scale-wrap",
					style: v(j(ye))
				}, [
					s("div", Kn, [D(n.$slots, "global-top")]),
					s("div", {
						class: g(je.value),
						ref_key: "transitionWrapEl",
						ref: J
					}, [
						We.value ? (S(), i(jt, {
							class: "sp-slide-prev",
							key: j(m) - 1,
							slide: We.value,
							html: Ke.value,
							fixedStep: qe.value - 1,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"fixedStep",
							"components"
						])) : a("", !0),
						j(_) ? (S(), i(jt, {
							class: "sp-slide-current",
							key: j(m),
							slide: j(_),
							html: Ve.value,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0),
						Je.value ? (S(), i(jt, {
							class: "sp-slide-next",
							key: j(m) + 1,
							slide: Je.value,
							html: Xe.value,
							fixedStep: 0,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0)
					], 2),
					s("div", qn, [D(n.$slots, "global-bottom", {}, () => [s("footer", Jn, [s("span", null, A(j(m) + 1) + " / " + A(ze.value), 1), s("span", null, A(t.author), 1)])])]),
					j(V).chunkletMode ? (S(), o("div", {
						key: 0,
						class: g(["sp-chunklet-overlay", { "sp-chunklet-drag": zt.value === "drag" }]),
						onPointerdown: Yt,
						onPointermove: Xt,
						onPointerup: Zt
					}, [s("div", Yn, [l(A(zt.value === "drag" ? "Click + drag to draw " + j(V).selectedChunklet?.name : zt.value === "click" ? "Click to place " + j(V).selectedChunklet?.name : "Click to insert " + j(V).selectedChunklet?.name) + " ", 1), r[16] ||= s("span", { class: "sp-chunklet-hint-esc" }, "ESC to cancel", -1)]), qt.value ? (S(), o("div", {
						key: 0,
						class: "sp-chunklet-preview",
						style: v(Jt.value)
					}, null, 4)) : a("", !0)], 34)) : a("", !0)
				], 4)], 4), [[te, !nt.value]]),
				s("nav", { class: g(["sp-nav", { locked: j(Q).navLocked }]) }, [s("div", Xn, [
					s("button", {
						class: g(["sp-nav-btn sp-nav-lock", { locked: j(Q).navLocked }]),
						title: j(Q).navLocked ? "Unlock nav" : "Lock nav visible",
						onClick: r[1] ||= (e) => j(Q).navLocked = !j(Q).navLocked
					}, [...r[17] ||= [s("svg", {
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
					})], -1)]], 10, Zn),
					s("button", {
						class: "sp-nav-btn",
						disabled: Pe.value && j(R),
						"aria-label": "Previous",
						onClick: Ue
					}, [...r[18] ||= [s("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 20 20",
						fill: "none"
					}, [s("path", {
						d: "M12 4l-6 6 6 6",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round"
					})], -1)]], 8, Qn),
					s("span", {
						class: "sp-nav-counter",
						onClick: _t
					}, A(j(m) + 1) + " / " + A(ze.value), 1),
					s("button", {
						class: "sp-nav-btn",
						disabled: Fe.value && j(z),
						"aria-label": "Next",
						onClick: He
					}, [...r[19] ||= [s("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 20 20",
						fill: "none"
					}, [s("path", {
						d: "M8 4l6 6-6 6",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round"
					})], -1)]], 8, $n),
					s("button", {
						class: "sp-nav-btn sp-fullscreen-btn",
						"aria-label": "Toggle fullscreen",
						title: "Fullscreen (F)",
						onClick: Ze
					}, [...r[20] ||= [s("svg", {
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
						class: g(["sp-nav-btn", { active: j(pe) }]),
						"aria-label": "Toggle presenter",
						title: "Presenter (P)",
						onClick: $e
					}, [...r[21] ||= [s("svg", {
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
						ref: it
					}, [s("button", {
						class: g(["sp-nav-btn sp-nav-more-btn", { active: rt.value }]),
						"aria-label": "More options",
						title: "More…",
						onClick: r[2] ||= (e) => rt.value = !rt.value
					}, "⋯", 2), rt.value ? (S(), o("div", er, [
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[3] ||= (e) => {
								ot(), rt.value = !1;
							}
						}, [s("span", tr, A(ct.value), 1), l(" " + A(st.value), 1)]),
						r[29] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[4] ||= (e) => {
								Lt(), rt.value = !1;
							}
						}, [...r[22] ||= [s("span", { class: "sp-nav-more-icon" }, "◇", -1), l(" Dev tools ", -1)]]),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[5] ||= (e) => {
								et.value = !et.value, rt.value = !1;
							}
						}, [...r[23] ||= [s("span", { class: "sp-nav-more-icon" }, "⊞", -1), l(" Overview ", -1)]]),
						s("button", {
							class: g(["sp-nav-more-item", { active: j(V).showChunkletsBar }]),
							onClick: r[6] ||= (e) => {
								Ut(), rt.value = !1;
							}
						}, [...r[24] ||= [s("span", { class: "sp-nav-more-icon" }, "▤", -1), l(" Chunks ", -1)]], 2),
						r[30] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[7] ||= (e) => Tt()
						}, [s("span", { class: g(["sp-nav-more-icon sp-nav-more-icon-blackout", { active: $.value }]) }, "●", 2), r[25] ||= l(" Blackout ", -1)]),
						s("div", nr, [
							s("button", {
								class: "sp-nav-more-browse-btn",
								title: "End of previous slide (A)",
								onClick: r[8] ||= (e) => Pt()
							}, [...r[26] ||= [s("svg", {
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
							})], -1)]]),
							r[28] ||= l(" | ", -1),
							s("button", {
								class: "sp-nav-more-browse-btn",
								title: "End of next slide (Z)",
								onClick: r[9] ||= (e) => It()
							}, [...r[27] ||= [s("svg", {
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
							})], -1)]])
						])
					])) : a("", !0)], 512)
				]), s("div", rr, [(S(!0), o(e, null, E(Z.value, (t) => (S(), o(e, { key: t.type === "pill" ? "p" + t.index : t.id }, [t.type === "ellipsis" ? (S(), o("span", ir, "…")) : (S(), o("button", {
					key: 1,
					class: g(["sp-nav-pill", {
						active: t.index === j(m),
						"sp-nav-pill-h1": dt.value[t.index] === 1,
						"sp-nav-pill-h2": dt.value[t.index] === 2,
						"sp-nav-pill-h3": dt.value[t.index] === 3
					}]),
					onClick: (e) => {
						j(M)(t.index), I.value = 0;
					},
					"aria-label": "Go to slide " + (t.index + 1)
				}, null, 10, ar))], 64))), 128))])], 2),
				j(V).showChunkletsBar && j(V).chunkletDefs.length ? (S(), o("div", or, [(S(!0), o(e, null, E(j(V).chunkletDefs, (e) => (S(), o("button", {
					key: e.name,
					class: g(["sp-chunklets-bar-btn", { active: j(V).selectedChunklet === e }]),
					onClick: (t) => Ht(e)
				}, [l(A(e.name) + " ", 1), s("span", cr, A(j(Vn)(e)), 1)], 10, sr))), 128)), s("button", {
					class: "sp-chunklets-bar-btn",
					onClick: r[10] ||= (e) => j(V).showChunkletsBar = !j(V).showChunkletsBar
				}, "×")])) : a("", !0),
				s("div", lr, [s("div", {
					class: "sp-progress-bar",
					style: v({ width: Ie.value + "%" })
				}, null, 4)]),
				$.value ? (S(), o("div", {
					key: 2,
					class: "sp-main-blackout",
					onClick: r[11] ||= (e) => $.value = !1
				}, [...r[31] ||= [s("span", { class: "sp-main-blackout-hint" }, "click to dismiss", -1)]])) : a("", !0)
			], 64)) : d.value == "presenter" ? (S(), i(pn, {
				key: 3,
				current: j(_),
				currentIndex: j(m),
				total: j(w),
				activeHtml: Ve.value,
				progressPercent: Ie.value,
				blackout: $.value,
				exitBlackout: Et,
				components: c.components,
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				config: j(Q),
				slides: j(p)
			}, null, 8, [
				"current",
				"currentIndex",
				"total",
				"activeHtml",
				"progressPercent",
				"blackout",
				"components",
				"designWidth",
				"designHeight",
				"config",
				"slides"
			])) : d.value == "print-slides" || d.value == "print-steps" ? (S(), i(gn, {
				key: 4,
				steps: d.value == "print-steps",
				components: c.components,
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				config: j(Q),
				slides: j(p)
			}, null, 8, [
				"steps",
				"components",
				"designWidth",
				"designHeight",
				"config",
				"slides"
			])) : a("", !0),
			et.value ? (S(), i(xn, {
				key: 5,
				slides: j(p),
				currentIndex: j(m),
				slideHeadingLevels: dt.value,
				overviewThumbStyle: lt.value,
				overviewSlideStyle: ut.value,
				components: c.components,
				onClose: r[12] ||= (e) => et.value = !1,
				onSelect: ft
			}, null, 8, [
				"slides",
				"currentIndex",
				"slideHeadingLevels",
				"overviewThumbStyle",
				"overviewSlideStyle",
				"components"
			])) : a("", !0),
			u(Qt, {
				visible: tt.value,
				"export-fn": j(V).export,
				onClose: r[13] ||= (e) => tt.value = !1
			}, null, 8, ["visible", "export-fn"]),
			pt.value ? (S(), i(jn, {
				key: 6,
				slides: j(p),
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				components: c.components,
				total: j(w),
				onClose: vt,
				onSelect: yt
			}, null, 8, [
				"slides",
				"designWidth",
				"designHeight",
				"components",
				"total"
			])) : a("", !0),
			c.raw?.after ? (S(), i(O(ue.value), { key: 7 })) : a("", !0)
		], 6));
	}
}), dr = /* @__PURE__ */ f({
	__name: "SpAlternatives",
	props: {
		at: { default: 0 },
		cycle: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let r = t, a = T(null), c = p("stepIndex") ?? { value: 0 }, l = M();
		function u() {
			let e = a.value?.closest(".sp-slide")?.querySelector("[data-fixed-step]")?.getAttribute("data-fixed-step");
			return e == null ? c.value : parseInt(e);
		}
		let d = n(() => (l.default?.() ?? []).filter((e) => typeof e.type == "string")), f = n(() => {
			if (d.value.length === 0) return -1;
			let e = u() - (typeof r.at == "string" ? parseInt(r.at, 10) : r.at);
			return e < 0 ? -1 : !r.cycle && e >= d.value.length ? d.value.length - 1 : e % d.value.length;
		});
		return (t, n) => (S(), o(e, null, [s("span", {
			ref_key: "ghostEl",
			ref: a,
			style: { display: "none" }
		}, null, 512), (S(!0), o(e, null, E(d.value, (e, t) => (S(), i(O(e), {
			key: t,
			class: g(t === f.value ? "sp-anim-shown" : "sp-anim-hidden sp-hidden-is-empty")
		}, null, 8, ["class"]))), 128))], 64));
	}
}), fr = /* @__PURE__ */ f({
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
		let t = e, r = p("stepIndex"), i = p("animInstances"), a = T(null);
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
				let e = ue(n[1]);
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
		let f = n(() => {
			if (!t.spec) return [];
			let e = [];
			for (let t of u.value) {
				let n = t.trim(), r = n.match(/^@(\w+)\((.+)\)$/);
				if (r) {
					let t = ue(r[1]);
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
			let n = d(), r = f.value[e - n - 1];
			if (!r) return;
			let i = m(), a = [...r].sort((e, t) => (e.delayedBy ?? 0) - (t.delayedBy ?? 0));
			for (let n of a) {
				let r = V._animActionTypes[n.type];
				if (r) if (n.delayedBy && !t) setTimeout(() => {
					try {
						r.apply(i, n);
					} catch (t) {
						console.error("(Caught) Error applying anim action:", t), q(`Error applying anim action at step ${e}: ${t}`);
					}
				}, n.delayedBy);
				else try {
					r.apply(i, n);
				} catch (t) {
					console.error("(Caught) Error applying anim action:", t), q(`Error applying anim action at step ${e}: ${t}`);
				}
			}
		}
		function _(e) {
			let t = d(), n = f.value[e - t - 1];
			if (!n) return;
			let r = m();
			for (let e of n) {
				let t = V._animActionTypes[e.type];
				t && t.reverse(r, e);
			}
		}
		function v(e, t) {
			if (e !== h) {
				if (e > h) for (let n = h + 1; n <= e; n++) g(n, t);
				else {
					for (let t = h; t > e; t--) _(t);
					for (let t = 1; t <= e; t++) g(t, !0);
				}
				h = e;
			}
		}
		function x(e = !0) {
			let t = m();
			for (let e of f.value) for (let n of e) try {
				V._animActionTypes[n.type]?.init?.(t, n);
			} catch (e) {
				console.error("(Caught) Error initializing anim action:", e), q(`Error initializing anim action: ${e}`);
			}
			let n = s();
			if (h = 0, e) for (let e = 1; e <= n; e++) g(e, !0);
			else for (let e = 1; e <= n; e++) g(e, !1);
			h = n;
		}
		return y(() => {
			let e = {
				syncToStep: v,
				refresh: x
			};
			i.add(e), x(), b(() => {
				i.delete(e);
			});
		}), (e, t) => (S(), o("span", {
			class: "sp-anim-ghost",
			ref_key: "animEl",
			ref: a
		}, null, 512));
	}
}), pr = ["data-debug"], mr = {
	key: 0,
	class: "sp-drag-edit-overlay"
}, hr = ["onMousedown", "onTouchstart"], gr = ["title"], _r = /*@__PURE__*/ f({
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
		let r = p("slideIndex", T(0)), i = t, c = n(() => {
			if (!i.at) return null;
			let e = i.at.split("|");
			return e.length < 5 ? null : {
				x: parseFloat(e[0]),
				y: parseFloat(e[1]),
				w: (/^\d+\.?\d*$/.test(e[2]), e[2]),
				h: (/^\d+\.?\d*$/.test(e[3]), e[3]),
				rotate: parseFloat(e[4])
			};
		}), l = T(null), u = T(!1), d = [
			"nw",
			"n",
			"ne",
			"e",
			"se",
			"s",
			"sw",
			"w"
		], f = T(0), m = T(0), h = T("auto"), _ = T("auto"), x = T(0);
		function C(e) {
			if (typeof e == "number") return e;
			let t = parseFloat(e);
			return isNaN(t) ? 0 : t;
		}
		function w() {
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
			f.value = C(O("x")), m.value = C(O("y")), h.value = O("w"), _.value = O("h"), x.value = C(O("rotate"));
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
					e.preventDefault(), f.value -= t;
					break;
				case "ArrowRight":
					e.preventDefault(), f.value += t;
					break;
			}
		}
		function j() {
			k(), l.value && (h.value === "auto" && (h.value = l.value.offsetWidth || 200), _.value === "auto" && (_.value = l.value.offsetHeight || 100)), u.value = !0, V.dragging = !0, window.addEventListener("keydown", A);
		}
		function M() {
			u.value = !1, V.dragging = !1, window.removeEventListener("keydown", A);
		}
		function ee() {
			let e = te(), t = te(!0);
			if (t === e) {
				M();
				return;
			}
			let n = !!i.at, a = l.value?.getAttribute("data-drag-id"), o = l.value?.getAttribute("data-source-line"), s = l.value?.getAttribute("data-source-file") || Qe(l.value);
			fetch("/__sp_edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					oldAttrs: n ? t : "__sp_insert__",
					newAttrs: e,
					file: s,
					sourceLine: o ? parseInt(o, 10) : null,
					editableIndex: i.editableIndex,
					slide: r.value,
					dragId: a
				})
			}).then(async (t) => {
				let n = await t.json();
				(!t.ok || !n.ok) && (console.error("SP edit failed:", t.status, n), N(e));
			}).catch((t) => {
				console.error("SP edit error:", t), N(e);
			}).finally(() => M());
		}
		function te(e = !1) {
			return `at="${e ? O("x") : Math.round(f.value)}|${e ? O("y") : Math.round(m.value)}|${e ? O("w") : h.value}|${e ? O("h") : _.value}|${e ? O("rotate") : Math.round(x.value * 10) / 10}"`;
		}
		function N(e) {
			navigator.clipboard?.writeText(e).catch(() => {}), alert(`Could not auto-save to source.\n\nCopy this attribute and replace the existing sp-drag at attribute manually:\n\n${e}`);
		}
		let ne = n(() => `Save: x=${Math.round(f.value)} y=${Math.round(m.value)} w=${h.value} h=${_.value} rotate=${Math.round(x.value * 10) / 10}`);
		function re() {
			u.value ? ee() : j();
		}
		let P = (e) => typeof e == "number" || /^\d+(\.\d+)?$/.test(e) ? e + "px" : e, ie = n(() => ({
			position: "absolute",
			left: P(f.value),
			top: P(m.value),
			width: P(h.value),
			height: P(_.value),
			transform: x.value ? `rotate(${x.value}deg)` : void 0
		})), I = !1, L = 0, R = 0, z = 0, ae = 0, B = 0;
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
		function ce(e) {
			if (u.value) {
				e.preventDefault(), U(e);
				return;
			}
			let t = Date.now();
			if (t - se < 300) {
				e.preventDefault(), re(), se = 0;
				return;
			}
			se = t;
		}
		function H() {
			I && (I = !1, document.removeEventListener("mousemove", W), document.removeEventListener("mouseup", H), document.removeEventListener("touchmove", W), document.removeEventListener("touchend", H), setTimeout(() => B--, 0));
		}
		function U(e) {
			if (!u.value) return;
			J(), I = !0, B++;
			let { clientX: t, clientY: n } = oe(e);
			L = t, R = n, z = f.value, ae = m.value, document.addEventListener("mousemove", W), document.addEventListener("mouseup", H), document.addEventListener("touchmove", W, { passive: !1 }), document.addEventListener("touchend", H);
		}
		function W(e) {
			if (!I) return;
			e.preventDefault();
			let t = w(), { clientX: n, clientY: r } = oe(e), i = (n - L) / t, a = (r - R) / t;
			f.value = z + i, m.value = ae + a;
		}
		let le = !1, ue = "", de = 0, fe = 0, pe = 0, me = 0, G = 0, K = 0;
		function he() {
			le && (le = !1, document.removeEventListener("mousemove", q), document.removeEventListener("mouseup", he), document.removeEventListener("touchmove", q), document.removeEventListener("touchend", he), setTimeout(() => B--, 0));
		}
		function ge(e, t) {
			if (!u.value) return;
			J(), le = !0, B++;
			let { clientX: n, clientY: r } = oe(e);
			ue = t, de = n, fe = r, pe = f.value, me = m.value, G = C(h.value), K = C(_.value), document.addEventListener("mousemove", q), document.addEventListener("mouseup", he), document.addEventListener("touchmove", q, { passive: !1 }), document.addEventListener("touchend", he);
		}
		function q(e) {
			if (!le) return;
			e.preventDefault();
			let t = w(), { clientX: n, clientY: r } = oe(e), i = (n - de) / t, a = (r - fe) / t, o = pe, s = me, c = G, l = K;
			switch (ue) {
				case "n":
					s = me + a, l = K - a;
					break;
				case "s":
					l = K + a;
					break;
				case "e":
					c = G + i;
					break;
				case "w":
					o = pe + i, c = G - i;
					break;
				case "ne":
					s = me + a, l = K - a, c = G + i;
					break;
				case "nw":
					o = pe + i, s = me + a, c = G - i, l = K - a;
					break;
				case "se":
					c = G + i, l = K + a;
					break;
				case "sw":
					o = pe + i, c = G - i, l = K + a;
					break;
			}
			c < 10 && (c = 10), l < 10 && (l = 10), f.value = o, m.value = s, h.value = c, _.value = l;
		}
		let _e = !1, ve = 0, ye = 0, be = 0, xe = 0;
		function Se() {
			_e && (_e = !1, document.removeEventListener("mousemove", we), document.removeEventListener("mouseup", Se), document.removeEventListener("touchmove", we), document.removeEventListener("touchend", Se), setTimeout(() => B--, 0));
		}
		function Ce(e) {
			if (!u.value) return;
			J(), _e = !0, B++;
			let t = l.value.getBoundingClientRect(), { clientX: n, clientY: r } = oe(e);
			ve = t.left + t.width / 2, ye = t.top + t.height / 2, be = Math.atan2(r - ye, n - ve), xe = x.value, document.addEventListener("mousemove", we), document.addEventListener("mouseup", Se), document.addEventListener("touchmove", we, { passive: !1 }), document.addEventListener("touchend", Se);
		}
		function we(e) {
			if (!_e) return;
			e.preventDefault();
			let { clientX: t, clientY: n } = oe(e), r = Math.atan2(n - ye, t - ve) - be;
			x.value = xe + 180 / Math.PI * r;
		}
		function J() {
			H(), he(), Se();
		}
		k(), y(() => {
			document.addEventListener("click", Y);
		}), b(() => {
			document.removeEventListener("click", Y);
		});
		function Y(e) {
			u.value && (B > 0 || l.value && (l.value.contains(e.target) || ee()));
		}
		return (n, r) => (S(), o("div", {
			ref_key: "el",
			ref: l,
			class: g(["sp-drag", { "sp-drag-editing": u.value }]),
			style: v(ie.value),
			onDblclick: re,
			onMousedown: U,
			onTouchstart: ce,
			"data-debug": t.editableIndex
		}, [s("div", { class: g(["sp-drag-content", { "sp-drag-content-blocked": u.value }]) }, [D(n.$slots, "default", {}, void 0, !0)], 2), u.value ? (S(), o("div", mr, [
			r[1] ||= s("div", { class: "sp-drag-edit-border" }, null, -1),
			(S(), o(e, null, E(d, (e) => s("div", {
				key: e,
				class: g(["sp-drag-handle", "sp-handle-" + e]),
				onMousedown: F((t) => ge(t, e), ["stop"]),
				onTouchstart: F((t) => ge(t, e), ["stop", "prevent"])
			}, null, 42, hr)), 64)),
			r[2] ||= s("div", { class: "sp-drag-rotate-line" }, null, -1),
			s("div", {
				class: "sp-drag-rotate-handle",
				onMousedown: F(Ce, ["stop"]),
				onTouchstart: F(Ce, ["stop", "prevent"])
			}, null, 32),
			s("button", {
				class: "sp-drag-save-btn",
				title: ne.value,
				onMousedown: r[0] ||= F(() => {}, ["stop"]),
				onClick: F(ee, ["stop"])
			}, " Save ", 40, gr)
		])) : a("", !0)], 46, pr));
	}
}), vr = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, yr = /*#__PURE__*/ vr(_r, [["__scopeId", "data-v-7b3a8916"]]), br = ["src", "alt"], xr = {
	key: 1,
	class: "sp-img-loading"
}, Sr = /*#__PURE__*/ vr(/* @__PURE__ */ f({
	__name: "SpImg",
	props: {
		src: {},
		alt: { default: "" }
	},
	setup(e) {
		let t = e, n = T("");
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
				let t = Re(e);
				if (t.value) {
					n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
					return;
				}
				try {
					if (await Be(e), t.value) {
						n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
						return;
					}
				} catch {}
				n.value = e;
				return;
			}
			let r = ze(e);
			if (r.value) {
				n.value = r.value;
				return;
			}
			try {
				if (await Ve(e), r.value) {
					n.value = r.value;
					return;
				}
			} catch {}
			n.value = e;
		}
		return N(() => t.src, r, { immediate: !0 }), (t, r) => n.value ? (S(), o("img", {
			key: 0,
			src: n.value,
			alt: e.alt,
			class: g(t.$attrs.class),
			style: v(t.$attrs.style)
		}, null, 14, br)) : (S(), o("span", xr, "…"));
	}
}), [["__scopeId", "data-v-9678aed9"]]), Cr = /* @__PURE__ */ f({
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
		let t = e, n = M();
		return y(() => {
			h(() => {
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
		}), (e, t) => D(e.$slots, "default");
	}
}), wr = /* @__PURE__ */ f({
	__name: "SpStyle",
	props: { css: { default: "" } },
	setup(e) {
		let t = e, n = p("slideNum", void 0), r = M(), i = T(null);
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
		return y(() => {
			let e = a();
			if (!e) return;
			let t = document.createElement("style");
			t.textContent = o(e), document.head.appendChild(t), i.value = t;
		}), b(() => {
			i.value?.remove();
		}), (e, t) => null;
	}
});
//#endregion
//#region src/composables/useSlideTree.ts
function Tr(e) {
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
var Er = {
	key: 0,
	class: "sp-toc"
}, Dr = {
	key: 0,
	class: "sp-toc-section"
}, Or = ["onClick"], kr = { class: "sp-toc-text" }, Ar = /* @__PURE__ */ f({
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
		}, c = p("slides"), l = p("slideIndex"), u = p("goTo"), { tree: d } = Tr(n(() => c.value)), f = n(() => l.value + i(r.highlight)), m = n(() => {
			let e = d.value, t = e.filter((e) => e.level >= i(r.start) && e.level <= i(r.end));
			if (i(r.start) > 1) {
				let n = i(r.start) - 1, a = f.value, o = e.slice().reverse().find((e) => e.level === n && e.slideIndex <= a);
				if (!o) console.warn(`[sp-toc] no h${n} before slide ${a + 1}, showing all`);
				else {
					let n = e.filter((e) => e.level < i(r.start)), a = n.indexOf(o), s = o.slideIndex, c = a + 1 < n.length ? n[a + 1].slideIndex : Infinity;
					t = t.filter((e) => e.slideIndex >= s && e.slideIndex < c);
				}
			}
			return t;
		}), h = n(() => {
			if (i(r.start) <= 1) return null;
			let e = d.value, t = i(r.start) - 1, n = f.value;
			return e.slice().reverse().find((e) => e.level === t && e.slideIndex <= n) ?? null;
		});
		return (t, n) => m.value.length ? (S(), o("nav", Er, [D(t.$slots, "default", {
			items: m.value,
			currentIndex: j(l).value,
			goTo: j(u),
			activeSection: h.value
		}, () => [r.context && h.value ? (S(), o("div", Dr, A(h.value.text), 1)) : a("", !0), s("ol", null, [(S(!0), o(e, null, E(m.value, (e) => (S(), o("li", {
			key: e.slideIndex,
			class: g(["sp-toc-h" + e.level, { "sp-toc-active": e.slideIndex === f.value }]),
			onClick: (t) => j(u)(e.slideIndex)
		}, [s("span", kr, A(e.text), 1)], 10, Or))), 128))])])])) : a("", !0);
	}
}), jr = 1, Mr = {
	"": 1,
	px: 1,
	cm: 96 / 2.54,
	mm: 96 / 10 / 2.54,
	Q: 96 / 40 / 2.54,
	in: 96,
	pc: 96 / 6,
	pt: 96 / 72
};
function Nr(e) {
	if (!e) return 0;
	let t = e.match(/^([\d.]+)(\w*)$/);
	return t ? parseFloat(t[1]) * (Mr[t[2]] ?? 1) : 0;
}
var Pr = (e) => {
	let t = e.querySelector("svg");
	if (!t || t.getAttribute("viewBox")) return;
	let n = Nr(t.getAttribute("width")), r = Nr(t.getAttribute("height"));
	n && r && (t.setAttribute("viewBox", `0 0 ${n} ${r}`), t.removeAttribute("width"), t.removeAttribute("height"));
}, Fr = (e) => {
	e.querySelectorAll("[*|href]:not([href])").forEach((e) => {
		let t = e.getAttributeNS("http://www.w3.org/1999/xlink", "href");
		t && (e.setAttribute("href", t), e.removeAttributeNS("http://www.w3.org/1999/xlink", "href"));
	});
}, Ir = (e) => {
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
		let i = `svgid-${jr++}`;
		r.id = i;
		for (let { el: t, attr: r } of n[e]) {
			let n = t.getAttribute(r);
			t.setAttribute(r, n.replace("#" + e, "#" + i));
		}
	}
}, Lr = (e) => {
	e.querySelectorAll("[style]").forEach((e) => {
		let t = e.getAttribute("style");
		t && (t.split(";").forEach((t) => {
			let n = t.trim();
			if (!n || n.startsWith("-")) return;
			let [r, ...i] = n.split(":").map((e) => e.trim());
			r && i.length && e.setAttribute(r, i.join(":"));
		}), e.removeAttribute("style"));
	});
}, Rr = [
	Pr,
	Fr,
	Ir,
	Lr
], zr = /*#__PURE__*/ vr(/* @__PURE__ */ f({
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
			let e = [...Rr];
			return t.width != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("width", String(t.width));
			}), t.height != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("height", String(t.height));
			}), e;
		});
		return (t, n) => e.wrap ? (S(), o("div", m({ key: 0 }, t.$attrs, { class: "sp-svg-wrap" }), [u(Jr, {
			src: e.src,
			path: e.path,
			transformers: r.value,
			"no-fix-void": "",
			"no-component": ""
		}, null, 8, [
			"src",
			"path",
			"transformers"
		])], 16)) : (S(), i(Jr, m({ key: 1 }, t.$attrs, {
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
}), [["__scopeId", "data-v-1d4193db"]]), Br = {
	key: 0,
	class: "sp-slide-source"
}, Vr = { class: "sp-slide-source-header" }, Hr = ["innerHTML"], Ur = /*#__PURE__*/ vr(/* @__PURE__ */ f({
	__name: "SpSlideSource",
	props: {
		for: { default: void 0 },
		transform: {
			type: [Function, null],
			default: null
		}
	},
	setup(e) {
		let t = e, r = p("rawSlideSources"), i = p("slideIndex"), c = n(() => t.for === void 0 ? i.value : t.for), u = T(""), d = 0;
		return N([
			c,
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
				let e = await Ln(a);
				i === d && (u.value = e);
			} catch {
				i === d && (u.value = a);
			}
		}, { immediate: !0 }), (e, t) => u.value ? (S(), o("div", Br, [s("div", Vr, [D(e.$slots, "header", { forSlide: c.value }, () => [l(" Slide " + A(c.value + 1) + " source ", 1)], !0)]), s("div", {
			class: "sp-slide-source-body",
			innerHTML: u.value
		}, null, 8, Hr)])) : a("", !0);
	}
}), [["__scopeId", "data-v-8a380df0"]]), Wr = ["data-source-file-push"], Gr = ["innerHTML"], Kr = /*@__PURE__*/ f({
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
		let n = p("contentVersion"), r = p("sp-components", {}), a = d(() => Promise.resolve().then(() => qr)), c = t, l = T(""), u = T(""), g = k(null), v = T(null);
		b(() => {
			v.value && clearTimeout(v.value);
		});
		function y(e) {
			c.noFixVoid || (e = Se(e)), e = Ce(e);
			let t = document.createElement("div");
			if (t.innerHTML = e, c.path) {
				let e = t.querySelector(c.path);
				if (!e) return "";
				t.innerHTML = "", t.appendChild(e.cloneNode(!0));
			}
			for (let e of c.transformers) e(t);
			return t.innerHTML;
		}
		function x(e) {
			if (!e) {
				g.value = null;
				return;
			}
			g.value = f({
				template: `<div class="sp-include">${e}</div>`,
				components: {
					"sp-alternatives": dr,
					"sp-anim": fr,
					"sp-drag": yr,
					"sp-img": Sr,
					"sp-include": a,
					"sp-step": Cr,
					"sp-style": wr,
					"sp-toc": Ar,
					"sp-svg": zr,
					"sp-slide-source": Ur,
					...r
				}
			});
		}
		function C() {
			h(() => {
				n.value++;
			});
		}
		return N(Re(c.src), async (e) => {
			if (e) v.value &&= (clearTimeout(v.value), null), l.value = "", u.value = y(e), c.noComponent || x(u.value), C();
			else if (e === void 0) {
				if (v.value) return;
				v.value = setTimeout(() => {
					g.value = null, v.value = null;
				}, 500);
				try {
					await Be(c.src);
				} catch (e) {
					l.value = `${e.message} (src: ${c.src})`, v.value &&= (clearTimeout(v.value), null);
				}
			}
		}, { immediate: !0 }), (n, r) => (S(), o(e, null, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": t.src
			}, null, 8, Wr),
			l.value ? (S(), o("div", m({ key: 0 }, n.$attrs, { class: "sp-include-error" }), A(l.value), 17)) : c.noComponent ? (S(), o("div", m({ key: 1 }, n.$attrs, {
				class: "sp-include",
				innerHTML: u.value
			}), null, 16, Gr)) : (S(), i(O(g.value), _(m({ key: 2 }, n.$attrs)), null, 16)),
			r[0] ||= s("span", {
				style: { display: "none" },
				"data-source-file-pop": ""
			}, null, -1)
		], 64));
	}
}), qr = /* @__PURE__ */ I({ default: () => Jr }), Jr = /*#__PURE__*/ vr(Kr, [["__scopeId", "data-v-a3f50969"]]), Yr = {
	"sp-alternatives": dr,
	"sp-anim": fr,
	"sp-drag": yr,
	"sp-img": Sr,
	"sp-include": Jr,
	"sp-svg": zr,
	"sp-step": Cr,
	"sp-style": wr,
	"sp-toc": Ar,
	"sp-slide-source": Ur
};
function Xr(e) {
	return typeof e == "string" ? document.querySelector(e) : e ?? null;
}
function Zr(e) {
	if (e.tagName === "TEMPLATE") {
		let t = document.createElement("div");
		return t.append(e.content.cloneNode(!0)), t.innerHTML;
	}
	return e.textContent || "";
}
function Qr(e) {
	let t = e.trim();
	if (!t) return {};
	try {
		let e = JSON.parse(t);
		if (e && typeof e == "object" && !Array.isArray(e)) return {
			config: e.config,
			css: e.css,
			js: e.js,
			jsMounted: e["js-mounted"] ?? e.jsMounted
		};
	} catch {
		console.warn("sp-init: could not parse payload", e.slice(0, 80));
	}
	return {};
}
function $r(e) {
	if (!e || !e.trim()) return;
	let t = document.createElement("script");
	t.textContent = e, (document.head ?? document.documentElement).appendChild(t), t.remove();
}
function ei(e) {
	if (!e || !e.trim()) return;
	let t = document.createElement("style");
	t.textContent = e, document.head.appendChild(t), H.add(t);
}
function ti(e) {
	let t = document.documentElement;
	Array.from(t.classList).filter((e) => e.startsWith("theme-")).forEach((e) => t.classList.remove(e)), t.classList.add("theme-" + e.replace(/[^a-zA-Z0-9_-]/g, ""));
}
function ni() {
	let e = document.getElementById("sp-presentation");
	if (!e) return {};
	let t = {}, n = (t) => {
		let n = e.getAttribute(t);
		return n ? parseInt(n, 10) : void 0;
	}, r = n("data-design-width"), i = n("data-design-height");
	r !== void 0 && i !== void 0 && (t.designWidth = r, t.designHeight = i);
	let a = e.getAttribute("data-author");
	a !== null && (t.author = a);
	let o = n("data-seed");
	o !== void 0 && (t.seed = o);
	let s = e.getAttribute("data-theme");
	s !== null && s && (t.theme = s);
	let c = e.getAttribute("data-transition");
	c !== null && c && (t.transition = c);
	let l = n("data-transition-duration");
	l !== void 0 && (t.transitionDuration = l);
	let u = e.getAttribute("data-presenter");
	u !== null && (t.presenter = u === "" || u === "true" || u === "1");
	let d = e.getAttribute("data-sp-init");
	if (d) try {
		let e = JSON.parse(d);
		e && typeof e == "object" && !Array.isArray(e) && Object.assign(t, e);
	} catch {
		console.warn("sp-init: could not parse data-sp-init attribute on #sp-presentation");
	}
	return t;
}
async function ri(e = {}) {
	let t = document.getElementById("sp-init"), n = t ? Qr(Zr(t)) : {};
	$r(n.js), ei(n.css);
	let i = {
		...ni(),
		...n.config ?? {},
		...e
	}, { el: a, transition: o, transitionDuration: s, designWidth: c, designHeight: l, author: u, components: d, seed: f, cacheIgnore: p, plugins: m, activate: h, theme: g, presenter: _ } = i, v = i.slides;
	g && ti(String(g));
	let y = document.getElementById("sp-content"), b = document.getElementById("sp-cache"), x = {}, S = null, C = [];
	if (y) {
		let e = await Ze(y.textContent || "");
		C.push(...oe(e));
		let t = we(Ce(Se(e)));
		S = document.createElement("div"), S.innerHTML = t;
	}
	if (!v) {
		if (b?.content) {
			let e = b.content.textContent?.trim();
			e && Ue(e);
		}
		S && (v = B(S), o && v.forEach((e) => {
			e.transition === "" && (e.transition = o);
		}));
	}
	S && ae(S, x);
	let w = document.getElementById("sp-chunklets");
	if (w?.tagName === "SCRIPT") {
		let e = w.textContent || "";
		e.trim() && (V.chunkletDefs = Rn(e));
	}
	document.querySelectorAll("template[data-sp-cache]").forEach((e) => {
		let t = e.getAttribute("data-sp-cache"), n = Zr(e).trim();
		t && n && (Re(t).value = n);
	});
	let E = [];
	function D(e) {
		Array.from(e.children).forEach((e) => {
			if (["sp-style", "style"].includes(e.tagName.toLowerCase())) {
				let t = e.getAttribute("css") ?? e.textContent?.trim();
				if (!t) return;
				let n = document.createElement("style");
				n.textContent = t, document.head.appendChild(n), E.push(n), H.add(n);
			}
		});
	}
	function O() {
		E.forEach((e) => e.remove()), E = [];
	}
	function k(e) {
		O();
		let t = document.createElement("div");
		t.innerHTML = e, D(t);
	}
	if (p && Fe(p), S) {
		D(S);
		let e = [];
		S.querySelectorAll("sp-include").forEach((t) => {
			let n = t.getAttribute("src");
			n && e.push(Be(n));
		});
		let t = /* @__PURE__ */ new Set();
		S.querySelectorAll("img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), S.querySelectorAll("sp-img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), t.forEach((t) => {
			t.match(/\.svg(\?|#|$)/i) ? e.push(Be(t)) : e.push(Ve(t));
		}), await Promise.all(e);
	}
	let A = {
		...Yr,
		...d
	}, j = Xr(a) ?? document.getElementById("sp-presentation") ?? document.getElementById("app") ?? document.body, M = new URLSearchParams(window.location.search), ee = _ ?? M.has("presenter");
	Object.assign(ce, {
		transition: o,
		transitionDuration: s,
		designWidth: c,
		designHeight: l,
		author: u,
		seed: f,
		theme: g,
		raw: x,
		el: "#app"
	});
	let te = [...m ?? []];
	h && te.unshift({
		name: "__user__",
		order: 100,
		activate: h
	});
	let N = te.sort((e, t) => (e.order ?? 0) - (t.order ?? 0));
	for (let e of N) await K.register(e);
	function ne(e) {
		return window.location.search.match(`[?]${e}($|[?])`);
	}
	let re = ne("print") ? ne("steps") ? "steps" : "slides" : !1, P = r(ur, {
		slides: v,
		rawSlideSources: C,
		transition: o,
		transitionDuration: s,
		designWidth: c,
		designHeight: l,
		author: u,
		seed: f,
		raw: x,
		components: A,
		presenter: ee,
		print: re
	});
	P.config.globalProperties.$sp = V, P.provide("sp-api", V), P.provide("sp-registry", K);
	let F = T(0);
	P.provide("liveUpdatesCount", F), typeof globalThis < "u" && (globalThis.__sp__ = V);
	let ie = P.mount(j);
	if ($r(n.jsMounted), P.use = async (e) => (await K.register(e), ie.rebuildKeymap(), P), typeof EventSource < "u") {
		let e = new EventSource("/__sp_events"), t = (e) => {
			let t = 0;
			for (let n of e) t = (t << 5) - t + n.charCodeAt(0), t |= 0;
			return t;
		}, n = parseInt(window.localStorage.getItem("sp-non-content-hash") ?? "0", 10);
		e.addEventListener("update", (e) => {
			F.value++;
			let r = (e.data ?? "").trim();
			r ? Ke(r) : Ge(), fetch(window.location.href + "?_=" + Date.now()).then((e) => e.text()).then((e) => {
				let r = t(e.replace(/<script\s+type="text\/html"\s+id="sp-content">[\s\S]*?<\/script>/, ""));
				if (n !== 0 && n !== r) {
					window.localStorage.setItem("sp-non-content-hash", r.toString()), window.location.reload();
					return;
				}
				n = r;
				let i = e.match(/<script\s+type="text\/html"\s+id="sp-content">([\s\S]*?)<\/script>/);
				i && (async () => {
					let e = await Ze(i[1]);
					_e(), ie.updateSlides?.(e), k(e);
				})().catch(() => {});
			}).catch(() => {});
		}), e.addEventListener("connected", () => {}, { once: !0 }), e.addEventListener("typst-error", (e) => {
			_e();
			try {
				let t = JSON.parse(e.data ?? "[]");
				(Array.isArray(t) ? t : [t]).forEach((e) => q(e));
			} catch {}
		});
	}
	return P.export = Mn, P;
}
//#endregion
export { dr as SpAlternatives, fr as SpAnim, yr as SpDrag, Sr as SpImg, Jr as SpInclude, ur as SpPresentation, jt as SpSlide, Ur as SpSlideSource, wr as SpStyle, zr as SpSvg, Ar as SpToc, Pr as addViewBox, ft as bind, Vn as chunkPlacementMode, pt as createDefaultKeymap, ri as createSlidesPurryst, Rr as defaultTransformers, he as definePlugin, Mn as exportStandalone, Ir as idRewrite, G as injectStyle, me as listAnimActionTypes, fe as listAnimCommands, Ae as maybeProcessed, U as parseArgs, zn as parseChunklets, Rn as parseChunkletsFromText, B as parseElementToSlides, Oe as processSlideHtml, pe as registerAnimActionType, de as registerAnimCommand, K as registry, St as resetConfig, V as spApi, Lr as styleToAttributes, Bn as substituteParams, $t as useElementScale, dt as useKeymap, mt as useNavigation, ht as usePresenter, gt as useScale, Tr as useSlideTree, se as useSlides, ke as useSteps, xt as useStorage, Fr as xlinkRewrite };
