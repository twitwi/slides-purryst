import { Fragment as e, Teleport as t, computed as n, createApp as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createTextVNode as c, createVNode as l, defineAsyncComponent as u, defineComponent as d, inject as f, mergeProps as p, nextTick as m, normalizeClass as h, normalizeProps as g, normalizeStyle as _, onMounted as v, onUnmounted as y, onUpdated as b, openBlock as x, provide as S, reactive as C, ref as w, renderList as T, renderSlot as E, resolveDynamicComponent as D, shallowRef as O, toDisplayString as k, unref as A, useSlots as j, vModelText as M, vShow as N, watch as P, watchEffect as ee, withDirectives as te, withKeys as ne, withModifiers as F } from "vue";
//#region \0rolldown/runtime.js
var re = Object.defineProperty, I = (e, t) => {
	let n = {};
	for (var r in e) re(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || re(n, Symbol.toStringTag, { value: "Module" }), n;
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
function ie(e, t) {
	e.querySelectorAll("sp-before").forEach((e) => {
		let n = z(e).trim();
		n && (t.before = (t.before ?? "") + n);
	}), e.querySelectorAll("sp-after").forEach((e) => {
		let n = z(e).trim();
		n && (t.after = (t.after ?? "") + n);
	});
}
function ae(e) {
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
var B = C({
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
}), ce = {};
//#endregion
//#region src/animCommands.ts
function V(e) {
	let t = [], n = "", r = null;
	for (let i = 0; i < e.length; i++) {
		let a = e[i];
		r ? a === r ? r = null : n += a : a === "\"" || a === "'" ? r = a : a === "," ? (t.push(n.trim()), n = "") : n += a;
	}
	return t.push(n.trim()), t;
}
var H = {
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
B._animCommands = {
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
			let t = V(e), n = t[0] ?? "";
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
			let t = V(e);
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
			let t = V(e);
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
			let t = V(e);
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
				selector: V(e)[0] || "video"
			}];
		}
	}
}, B._animActionTypes = { ...H };
function U(e) {
	return B._animCommands[e];
}
function ue(e, t) {
	B._animCommands[e] = t;
}
function de() {
	return Object.keys(B._animCommands);
}
function fe(e, t) {
	B._animActionTypes[e] = t;
}
function pe() {
	return Object.keys(B._animActionTypes);
}
//#endregion
//#region src/plugin.ts
function me(e) {
	let t = document.createElement("style");
	t.textContent = e, document.head.appendChild(t);
}
var W = {
	_plugins: [],
	_keymapSetups: [],
	_animCommands: [],
	_animActionTypes: [],
	_domTransforms: [],
	_teardowns: /* @__PURE__ */ new Map(),
	async register(e) {
		this._plugins.push(e);
		let t = () => {}, n = e.disable ?? [], r = {
			spApi: B,
			addKeymapSetup: n.includes("keymap") ? t : (e) => this._keymapSetups.push(e),
			addAnimCommand: n.includes("anim") ? t : (e, t) => this._animCommands.push({
				name: e,
				handler: t
			}),
			addAnimActionType: n.includes("anim") ? t : (e, t) => this._animActionTypes.push({
				type: e,
				handler: t
			}),
			injectStyle: n.includes("style") ? t : me,
			addChunklet: n.includes("chunklet") ? t : (e) => B.chunkletDefs.push(e),
			addDomTransform: n.includes("domTransform") ? t : (e) => this._domTransforms.push(e)
		}, i = e.activate(r), a = i instanceof Promise ? await i : i;
		if (a) {
			let t = this._teardowns.get(e.name) ?? [];
			t.push(a), this._teardowns.set(e.name, t);
		}
	},
	applyAnimRegistrations() {
		for (let { name: e, handler: t } of this._animCommands) ue(e, t);
		for (let { type: e, handler: t } of this._animActionTypes) fe(e, t);
	},
	unregister(e) {
		let t = this._plugins.findIndex((t) => t.name === e);
		t < 0 || ((this._teardowns.get(e) ?? []).forEach((e) => e()), this._teardowns.delete(e), this._plugins.splice(t, 1));
	}
};
function he(e) {
	return e;
}
var G = w([]);
function K(e) {
	G.value.length >= 10 && G.value.shift(), G.value.push(e);
}
function ge() {
	G.value = [];
}
//#endregion
//#region src/composables/useSteps.ts
function _e(e, t) {
	if (!e.trim()) return 0;
	let n = e.split("|").map((e) => e.trim()), r = 0;
	for (let e of n) {
		let n = e.match(/^@(\w+)\((.+)\)$/);
		if (n) {
			let e = U(n[1]);
			e ? r += e.countSteps(n[2], t) : r += 1;
		} else r += 1;
	}
	return r;
}
function ve(e) {
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
var ye = /* @__PURE__ */ RegExp("<(sp-anim|sp-jump|sp-pause|sp-meanwhile|sp-toc|sp-include|sp-svg|sp-slide-source)(\\s[^>]*)?/>", "gi"), be = /* @__PURE__ */ RegExp("<(sp-drag|sp-slide)(\\s[^>]*)?(/?)>", "gi");
function xe(e) {
	return e.replace(ye, "<$1$2></$1>");
}
function Se(e) {
	let t = 0;
	return e.replace(be, (e, n, r, i) => {
		let a = `<${n} :editable-index="${t}"${i || ""}${r || ""}>`;
		return (r ?? "").includes(":editable-index=") ? e : (t++, a);
	});
}
function Ce(e) {
	return e.replace(/(\p{Emoji_Presentation})/gu, (e) => `<span style="display: inline-flex; vertical-align: middle; line-height: 0;"><svg viewBox="0 0 100 100" style="width:1em; height:1em; display: block;"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${e}</text></svg></span>`);
}
function we(e) {
	e.querySelectorAll("sp-pause").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "+1"), e.replaceWith(t);
	}), e.querySelectorAll("sp-meanwhile").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "0"), e.replaceWith(t);
	});
}
function q(e) {
	let t = 0, n = (e) => {
		let r = Array.from(e.children);
		for (let e of r) e.tagName.toLowerCase() === "sp-step" && (e.getAttribute("also") === null ? t = parseInt(e.getAttribute("from") || "0", 10) : (e.setAttribute("from", String(t)), e.removeAttribute("also"))), n(e);
	};
	n(e);
}
function J(e) {
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
function Te(e) {
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
					let { relative: e, value: i } = ve(n.getAttribute("at"));
					e ? t += i : t = i, o.push(n), r(t);
					continue;
				}
				if (a === "sp-anim") {
					let i = [null, "false"].includes(n.getAttribute("no-jump")), a = n.getAttribute("at") ?? "+0", o = t, { relative: s, value: c } = ve(a);
					s ? o += c : o = c - 1, n.setAttribute("at", String(o));
					try {
						o += _e(n.getAttribute("spec") || "", e);
					} catch (e) {
						console.error("(Caught) Error counting anim spec parts:", e), K(`Error counting anim spec parts for <sp-anim> at step ${t}: ${e}`);
					}
					i ? (t = o, r(t)) : r(o);
				}
				if (a === "sp-alternatives") {
					let { relative: e, value: i } = ve(n.getAttribute("at") ?? "+0");
					e ? t += i : t = i, t += n.childElementCount, r(t - 1), s = !0, c = !0;
				}
				if (a === "sp-steps" || !s && n.hasAttribute("sp-steps")) {
					let e = n.getAttribute("at") ?? "+1", i = [null, "false"].includes(n.getAttribute("no-jump")), o = parseInt(n.getAttribute("every") || "1", 10), l = n.getAttribute("animation") || "", u = t, d = ve(e);
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
function Ee(e) {
	for (let t of W._domTransforms) t(e);
}
function Y(e) {
	let t = document.createElement("div");
	t.innerHTML = e, we(t), q(t), J(t);
	let n = Te(t);
	return Ee(t), {
		html: t.innerHTML,
		steps: n
	};
}
function De() {
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
var X = /* @__PURE__ */ new Map(), Oe = /* @__PURE__ */ new Map(), ke = /* @__PURE__ */ new Map(), Ae = /* @__PURE__ */ new Map(), je = [];
function Me(e) {
	je = e.map((e) => new RegExp(e));
}
function Ne(e) {
	return je.some((t) => t.test(e));
}
var Z = /* @__PURE__ */ new Map();
function Pe(e, t) {
	Z.set(e, {
		size: t ? t.length : 0,
		timestamp: Date.now()
	});
}
function Fe(e) {
	let t = X.get(e);
	return t || (t = w(void 0), X.set(e, t)), t;
}
function Ie(e) {
	let t = Oe.get(e);
	return t || (t = w(void 0), Oe.set(e, t)), t;
}
function Le(e) {
	if (Ne(e)) return Promise.resolve();
	let t = Fe(e);
	if (t.value !== void 0) return Promise.resolve();
	if (ke.has(e)) return ke.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.text();
	}).then((n) => {
		t.value = n, Pe(e, n), ke.delete(e);
	}).catch(() => {
		t.value = "", Pe(e), ke.delete(e);
	});
	return ke.set(e, n), n;
}
function Re(e) {
	if (Ne(e)) return Promise.resolve();
	let t = Ie(e);
	if (t.value !== void 0) return Promise.resolve();
	if (Ae.has(e)) return Ae.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.blob();
	}).then((e) => new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(r.result), r.onerror = n, r.readAsDataURL(e);
	})).then((n) => {
		t.value = n, Pe(e, n), Ae.delete(e);
	}).catch(() => {
		t.value = "", Pe(e), Ae.delete(e);
	});
	return Ae.set(e, n), n;
}
function ze() {
	let e = {};
	for (let [t, n] of X) n.value !== void 0 && (e[t] = n.value);
	let t = {};
	for (let [e, n] of Oe) n.value !== void 0 && (t[e] = n.value);
	return JSON.stringify({
		text: e,
		binary: t
	});
}
function Be(e) {
	let t = JSON.parse(e), n = Date.now();
	if (t.text) for (let [e, r] of Object.entries(t.text)) Fe(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
	else for (let [e, r] of Object.entries(t)) Fe(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
	if (t.binary) for (let [e, r] of Object.entries(t.binary)) Ie(e).value = r, Z.set(e, {
		size: r.length,
		timestamp: n
	});
}
function Ve() {
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
	for (let [t] of Oe) {
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
function He() {
	for (let e of X.values()) e.value = void 0;
	for (let [e] of X) Z.delete(e);
	ke.clear();
}
function Ue(e) {
	let t = window.location.href, n = new URL(e, t).href;
	for (let [e, r] of X) try {
		if (new URL(e, t).href === n) {
			r.value = void 0, Z.delete(e), ke.delete(e);
			return;
		}
	} catch {}
}
function We() {
	for (let e of X.values()) e.value = void 0;
	for (let e of Oe.values()) e.value = void 0;
	X.clear(), Oe.clear(), Z.clear(), ke.clear(), Ae.clear();
}
function Ge(e) {
	let t = X.get(e);
	t && (t.value = void 0);
	let n = Oe.get(e);
	n && (n.value = void 0), Z.delete(e);
}
//#endregion
//#region src/composables/resolveIncludes.ts
async function Ke(e) {
	let t = Fe(e);
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
function qe(e) {
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
			let n = await Ke(e);
			return n = xe(n), n = Se(n), {
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
		let n = RegExp(`<sp-include[^>]*?src="${qe(e)}"[^>]*?(\\/?>|><\\/sp-include>)`, "g");
		l = l.replace(n, t);
	}
	return l;
}
function Je(e) {
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
var Ye = [
	"Shift",
	"Meta",
	"Alt",
	"Control"
], Xe = 1e3, $ = "keydown", Ze = typeof navigator == "object" ? navigator.platform : "", Qe = /Mac|iPod|iPhone|iPad/.test(Ze) ? "Meta" : "Control", $e = Ze === "Win32" ? ["Control", "Alt"] : ["Alt"];
function et(e) {
	return !!(e.key && e.code && e.getModifierState);
}
function tt(e) {
	let t = e.target;
	return e.repeat || e.isComposing || t !== e.currentTarget && t.matches("[contenteditable],input,select,textarea");
}
function nt(e, t) {
	return typeof e.getModifierState == "function" ? e.getModifierState(t) || $e.includes(t) && e.getModifierState("AltGraph") : !1;
}
function rt(e) {
	return e.trim().split(" ").map((e) => {
		let t = e.split(/(?<=\w|\])\+/), n = t.pop(), r = n.match(/^\((.+)\)$/), i = r ? RegExp(`^(?:${r[1]})$`, "iv") : n, a = [], o = [];
		for (let e of t) {
			let t = e.match(/^\[(.*)\]$/), n = t?.[1] ?? e;
			n = n === "$mod" ? Qe : n, t ? o.push(n) : a.push(n);
		}
		return [
			a,
			o,
			i
		];
	});
}
function it(e, [t, n, r]) {
	let i = t.includes("AltGraph");
	return !((r instanceof RegExp ? !(r.test(e.key) || r.test(e.code)) : r.toUpperCase() !== e.key.toUpperCase() && r !== e.code) || t.find((t) => !nt(e, t)) || Ye.find((a) => !t.includes(a) && !n.includes(a) && r !== a && nt(e, a) && !(i && $e.includes(a))));
}
function at(e, t = {}) {
	let n = t.timeout ?? Xe, r = t.ignore ?? tt, i = Object.keys(e).map((t) => [
		t,
		rt(t),
		e[t]
	]), a = /* @__PURE__ */ new Map(), o = null;
	return (e) => {
		if (!et(e) || r(e)) return;
		let t = [];
		for (let [n, r, o] of i) {
			let [i, ...s] = a.get(n) || r;
			if (!it(e, i)) nt(e, e.key) || a.delete(n);
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
function ot(e, t, n = {}) {
	let r = n.event ?? $, i = at(t, n);
	return e.addEventListener(r, i, n.capture), () => {
		e.removeEventListener(r, i, n.capture);
	};
}
//#endregion
//#region src/keymap/manager.ts
var st = class {
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
		this._unsubscribe = ot(window, t, { ignore: (e) => tt(e) || this._getContext().dragging });
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
function ct(e) {
	let t = new st(e.getContext);
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
function lt(e, t) {
	let n = (t) => e(t);
	return t && (n.__bind = t), n;
}
//#endregion
//#region src/keymap/defaults.ts
function ut(e) {
	return (t) => {
		t.ArrowRight = t.Space = () => e.next(), t.ArrowLeft = () => e.prev(), t.ArrowUp = () => e.goToPrevBegin(), t.ArrowDown = () => e.goToNextBegin(), t.a = () => e.goToPrevEnd(), t.z = () => e.goToNextEnd(), t.Home = () => e.goTo(0), t.End = () => e.goTo(e.total.value - 1), t.f = lt(() => {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}, { preventDefault: !1 }), t.Escape = lt(() => {
			document.fullscreenElement && document.exitFullscreen().catch(() => {}), e.onOverviewExit?.(), e.onBlackoutExit?.();
		}, { preventDefault: !1 }), t.p = () => e.onPresenterToggle?.(), t.o = () => e.onOverviewToggle?.(), t.g = () => e.onGoPrompt?.(), t.b = () => e.onBlackoutToggle?.(), t.d = () => e.onDevPaneToggle?.(), t.c = () => e.onChunkBarToggle?.();
	};
}
//#endregion
//#region src/composables/useNavigation.ts
function dt(e, t) {
	let n = [ut(e), ...t?.extraSetups ?? []], { rebuild: r } = ct({
		getContext: t?.getContext ?? (() => ({
			overview: !1,
			presenter: !1,
			blackout: !1,
			devPane: !1,
			dragging: B.dragging,
			goPrompt: !1
		})),
		setupFns: n
	}), i = 0, a = 0;
	function o(e) {
		i = e.touches[0].clientX, a = e.touches[0].clientY;
	}
	function s(t) {
		if (B.dragging) return;
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
function ft() {
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
function pt(e = 1920, t = 1080) {
	let r = w(window.innerWidth), i = w(window.innerHeight);
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
var mt = "sp-config", ht = {
	navLocked: !1,
	overviewScale: .15,
	proMode: !1,
	logSteps: !1,
	darkMode: "light"
};
function gt() {
	try {
		let e = localStorage.getItem(mt);
		return e ? {
			...ht,
			...JSON.parse(e)
		} : { ...ht };
	} catch {
		return { ...ht };
	}
}
var _t = C(gt());
P(_t, () => {
	try {
		localStorage.setItem(mt, JSON.stringify(_t));
	} catch {}
}, { deep: !0 });
function vt() {
	return _t;
}
function yt() {
	for (let e of Object.keys(_t)) e in ht ? _t[e] = ht[e] : delete _t[e];
}
//#endregion
//#region src/components/SpStepManager.vue
var bt = /* @__PURE__ */ d({
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
}), xt = /* @__PURE__ */ d({
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
				"sp-step-manager": bt,
				...t.components
			};
			a.value = d({
				template: `<div${r}>${e}<sp-step-manager /></div>`,
				components: i
			});
		}, { immediate: !0 }), (e, t) => (x(), o("div", { class: h(r.value) }, [(x(), i(D(a.value)))], 2));
	}
}), St = { class: "sp-dev-pane" }, Ct = { class: "sp-dev-header" }, wt = { class: "sp-dev-section" }, Tt = {
	key: 0,
	class: "sp-dev-empty"
}, Et = {
	key: 1,
	class: "sp-dev-table"
}, Dt = ["title"], Ot = { class: "sp-dev-num" }, kt = { class: "sp-dev-num" }, At = ["onClick"], jt = ["disabled"], Mt = { class: "sp-dev-section" }, Nt = ["title"], Pt = { class: "sp-dev-section sp-dev-config" }, Ft = { class: "sp-dev-config-fields" }, It = { class: "sp-dev-config-label" }, Lt = {
	key: 0,
	class: "sp-dev-choice-group"
}, Rt = ["onClick"], zt = ["checked", "onChange"], Bt = [
	"min",
	"max",
	"step",
	"value",
	"onInput"
], Vt = ["value", "onInput"], Ht = /* @__PURE__ */ d({
	__name: "SpDevPane",
	props: {
		visible: { type: Boolean },
		exportFn: { type: Function }
	},
	emits: ["close"],
	setup(r, { emit: l }) {
		let u = vt(), d = n(() => {
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
		let E = r, D = w(Ve()), O = null;
		function j() {
			M(), O = setInterval(() => {
				D.value = Ve();
			}, 1e3);
		}
		function M() {
			O !== null && (clearInterval(O), O = null);
		}
		P(() => E.visible, (e) => {
			e ? (D.value = Ve(), j()) : M();
		}), v(() => {
			E.visible && j();
		}), y(M);
		function N() {
			We(), D.value = Ve();
		}
		function ee(e) {
			Ge(e), D.value = Ve();
		}
		function te() {
			E.exportFn?.();
		}
		function ne() {
			yt();
		}
		function re(e) {
			return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(1) + " MB";
		}
		function I(e) {
			if (!e) return "—";
			let t = new Date(e);
			return t.toLocaleTimeString() + " " + t.toLocaleDateString();
		}
		return (n, l) => (x(), i(t, { to: "body" }, [r.visible ? (x(), o("div", {
			key: 0,
			class: "sp-dev-overlay",
			onClick: l[1] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", St, [
			s("div", Ct, [s("h2", { onClick: C }, [l[2] ||= c(" Dev Tools ", -1), _.value > 0 ? (x(), o("span", {
				key: 0,
				class: h(["sp-dev-title-clicks", S.value])
			}, k(_.value) + "/9", 3)) : a("", !0)]), s("button", {
				class: "sp-dev-close",
				onClick: l[0] ||= (e) => n.$emit("close"),
				"aria-label": "Close"
			}, "×")]),
			s("section", wt, [
				s("h3", null, "Live Updates (" + k(A(g)) + ")", 1),
				s("h3", null, "Cache (" + k(D.value.length) + " entries)", 1),
				D.value.length === 0 ? (x(), o("div", Tt, "No cached entries")) : (x(), o("table", Et, [l[3] ||= s("thead", null, [s("tr", null, [
					s("th", null, "Path"),
					s("th", null, "Size"),
					s("th", null, "Fetched"),
					s("th", null, "Type"),
					s("th")
				])], -1), s("tbody", null, [(x(!0), o(e, null, T(D.value, (e) => (x(), o("tr", { key: e.path + e.type }, [
					s("td", {
						class: "sp-dev-path",
						title: e.path
					}, k(e.path), 9, Dt),
					s("td", Ot, k(re(e.size)), 1),
					s("td", kt, k(I(e.timestamp)), 1),
					s("td", null, k(e.type), 1),
					s("td", null, [s("button", {
						class: "sp-dev-del",
						onClick: (t) => ee(e.path),
						title: "Remove entry"
					}, "×", 8, At)])
				]))), 128))])])),
				s("button", {
					class: "sp-dev-btn",
					onClick: N,
					disabled: D.value.length === 0
				}, " Clear Cache ", 8, jt)
			]),
			s("section", Mt, [
				l[4] ||= s("h3", null, "Actions", -1),
				s("button", {
					class: "sp-dev-btn",
					onClick: te
				}, "Export Standalone"),
				s("button", {
					class: "sp-dev-btn",
					onClick: ne,
					title: d.value
				}, "Clear localStorage Keys", 8, Nt)
			]),
			s("details", Pt, [l[5] ||= s("summary", null, [s("h3", null, "Config")], -1), s("div", Ft, [(x(!0), o(e, null, T(m.value, (t) => (x(), o("label", {
				key: t.key,
				class: "sp-dev-config-field"
			}, [s("span", It, k(t.key), 1), t.type === "choice" ? (x(), o("span", Lt, [(x(!0), o(e, null, T(t.choices, (e) => (x(), o("button", {
				key: e,
				class: h(["sp-dev-choice-btn", { active: A(u)[t.key] === e }]),
				onClick: (n) => A(u)[t.key] = e
			}, k(e), 11, Rt))), 128))])) : t.type === "boolean" ? (x(), o("input", {
				key: 1,
				type: "checkbox",
				checked: !!A(u)[t.key],
				onChange: (e) => A(u)[t.key] = e.target.checked
			}, null, 40, zt)) : t.type === "number" ? (x(), o("input", {
				key: 2,
				type: "range",
				min: t.min ?? 0,
				max: t.max ?? 1,
				step: t.step ?? .01,
				value: A(u)[t.key],
				onInput: (e) => A(u)[t.key] = parseFloat(e.target.value)
			}, null, 40, Bt)) : (x(), o("input", {
				key: 3,
				type: "text",
				value: A(u)[t.key],
				onInput: (e) => A(u)[t.key] = e.target.value
			}, null, 40, Vt))]))), 128))])]),
			l[6] ||= s("footer", { class: "sp-dev-footer" }, [s("small", null, "toolbar ◆ to open")], -1)
		])])) : a("", !0)]));
	}
});
//#endregion
//#region src/composables/useElementScale.ts
function Ut(e, t, r) {
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
var Wt = { class: "sp-presenter-main" }, Gt = { class: "sp-presenter-sidebar" }, Kt = { class: "sp-presenter-info" }, qt = { class: "sp-presenter-num" }, Jt = { class: "sp-presenter-progress" }, Yt = ["title"], Xt = { class: "sp-presenter-clock-time" }, Zt = {
	key: 0,
	class: "sp-presenter-clock-feedback"
}, Qt = { class: "sp-presenter-notes" }, $t = ["innerHTML"], en = "sp-presentation-clock", tn = "sp-presentation-log", nn = /* @__PURE__ */ d({
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
		let t = e, r = f("stepIndex"), l = w(null), u = w(null), { transformStyle: d } = Ut(l, t.designWidth, t.designHeight), { transformStyle: p } = Ut(u, t.designWidth, t.designHeight), m = w(280), h = !1;
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
		function ne() {
			try {
				let e = localStorage.getItem(en);
				return e ? JSON.parse(e) : Date.now();
			} catch {
				return Date.now();
			}
		}
		function F() {
			try {
				localStorage.setItem(en, JSON.stringify(R.value));
			} catch {}
		}
		function re() {
			try {
				let e = localStorage.getItem(tn);
				return e ? JSON.parse(e) : [];
			} catch {
				return [];
			}
		}
		function I() {
			try {
				localStorage.setItem(tn, JSON.stringify(L.value));
			} catch {}
		}
		let L = w(re()), R = w(ne()), z = w(Date.now()), ie = null, ae = n(() => {
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
		function B(e, t) {
			let n = Math.floor((Date.now() - R.value) / 1e3);
			L.value.push({
				slide: e + 1,
				elapsed: n,
				step: t + 1
			}), I();
		}
		function ce() {
			confirm("Reset timer and clear slide log?") && (R.value = Date.now(), z.value = Date.now(), L.value = [], F(), I(), U("Reset"));
		}
		function V() {
			let e = new Date(R.value).toLocaleString(), t = ["slide,elapsed_sec,heading"];
			t.push(`0,0,"Started: ${e}"`);
			for (let e of L.value) {
				let n = e.heading ? `"${e.heading.replace(/"/g, "\"\"")}"` : "", r = e.step === void 0 ? String(e.slide) : `${e.slide}.${String(e.step).padStart(2, "0")}`;
				t.push(`${r},${e.elapsed},${n}`);
			}
			let n = t.join("\n");
			navigator.clipboard.writeText(n).catch(() => {});
			let r = new Blob([n], { type: "text/csv;charset=utf-8;" }), i = URL.createObjectURL(r), a = document.createElement("a");
			a.href = i, a.download = `slides-log-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, a.click(), URL.revokeObjectURL(i), U("Copied + Downloaded");
		}
		let H = w(""), le = null;
		function U(e) {
			H.value = e, le && clearTimeout(le), le = setTimeout(() => {
				H.value = "";
			}, 1500);
		}
		return P(() => [r.value, t.currentIndex], ([e, n], [r, i]) => {
			e === r ? t.config.logSteps && n !== i && B(e, n) : se(e);
		}), v(() => {
			R.value = ne(), F(), z.value = Date.now(), ie = setInterval(() => {
				z.value = Date.now();
			}, 1e3), se(t.currentIndex);
		}), y(() => {
			ie && clearInterval(ie), S(), j();
		}), (t, n) => (x(), o("div", {
			class: "sp-presenter-layout",
			style: _(C.value)
		}, [
			s("div", Wt, [
				s("div", {
					class: "sp-presenter-preview",
					ref_key: "previewContainerEl",
					ref: l
				}, [s("div", {
					style: _(A(d)),
					class: "sp-slide-scaler"
				}, [e.current ? (x(), i(xt, {
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
				}, [N.value ? (x(), i(xt, {
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
			s("div", Gt, [s("div", Kt, [
				s("div", qt, [c(k(e.currentIndex + 1) + " ", 1), s("small", null, "/ " + k(e.total), 1)]),
				s("div", Jt, [s("div", {
					class: "sp-presenter-progress-bar",
					style: _({ width: e.progressPercent + "%" })
				}, null, 4)]),
				s("div", {
					class: "sp-presenter-clock",
					title: oe.value
				}, [
					s("span", Xt, k(ae.value), 1),
					H.value ? (x(), o("span", Zt, k(H.value), 1)) : a("", !0),
					s("span", { class: "sp-presenter-clock-actions" }, [s("button", {
						class: "sp-presenter-clock-btn",
						title: "Export log (CSV)",
						onClick: V
					}, "⬇"), s("button", {
						class: "sp-presenter-clock-btn",
						title: "Reset timer",
						onClick: ce
					}, "↺")])
				], 8, Yt),
				e.blackout ? (x(), o("div", {
					key: 0,
					class: "sp-presenter-blackout-badge",
					onClick: n[0] ||= (...t) => e.exitBlackout && e.exitBlackout(...t)
				}, "BLACKED OUT")) : a("", !0)
			]), s("div", Qt, [n[2] ||= s("h3", null, "Speaker Notes", -1), s("div", {
				class: "sp-presenter-notes-content",
				innerHTML: M.value
			}, null, 8, $t)])])
		], 4));
	}
}), rn = { class: "sp-overview-grid" }, an = ["onClick"], on = { class: "sp-overview-thumb-stage" }, sn = { class: "sp-overview-thumb-num" }, cn = /* @__PURE__ */ d({
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
			onClick: r[0] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", rn, [(x(!0), o(e, null, T(t.slides, (e, r) => (x(), o("div", {
			key: r,
			class: h(["sp-overview-thumb", {
				active: r === t.currentIndex,
				"sp-overview-h1": t.slideHeadingLevels[r] === 1,
				"sp-overview-h2": t.slideHeadingLevels[r] === 2,
				"sp-overview-h3": t.slideHeadingLevels[r] === 3
			}]),
			style: _(t.overviewThumbStyle),
			onClick: (e) => n.$emit("select", r)
		}, [s("div", on, [s("div", { style: _(t.overviewSlideStyle) }, [l(xt, {
			slide: e,
			html: t.overviewHtmls[r],
			fixedStep: A(Y)(e.html).steps - 1,
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"fixedStep",
			"components"
		])], 4)]), s("div", sn, k(r + 1), 1)], 14, an))), 128))])]));
	}
}), ln = { class: "sp-go-prompt-box" }, un = ["onKeydown"], dn = {
	key: 0,
	class: "sp-go-results"
}, fn = ["onClick", "onMouseenter"], pn = { class: "sp-go-result-thumb" }, mn = { class: "sp-go-result-text" }, hn = { class: "sp-go-result-num" }, gn = ["innerHTML"], _n = {
	key: 1,
	class: "sp-go-no-results"
}, vn = /* @__PURE__ */ d({
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
			onClick: r[2] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", ln, [te(s("input", {
			ref_key: "goPromptInput",
			ref: f,
			"onUpdate:modelValue": r[0] ||= (e) => u.value = e,
			class: "sp-go-prompt-input",
			placeholder: "slide number or search text…",
			onKeydown: [
				ne(D, ["enter"]),
				r[1] ||= ne((e) => n.$emit("close"), ["escape"]),
				ne(F(C, ["prevent"]), ["down"]),
				ne(F(E, ["prevent"]), ["up"])
			]
		}, null, 40, un), [[M, u.value]]), g.value.length ? (x(), o("div", dn, [(x(!0), o(e, null, T(g.value, (n, r) => (x(), o("div", {
			key: n.index,
			class: h(["sp-go-result", { focused: r === d.value }]),
			onClick: (e) => O(n.index),
			onMouseenter: (e) => d.value = r
		}, [s("div", pn, [s("div", { style: _(y.value) }, [l(xt, {
			slide: t.slides[n.index],
			html: t.overviewHtmls[n.index],
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"components"
		])], 4)]), s("div", mn, [s("div", hn, "Slide " + k(n.index + 1), 1), (x(!0), o(e, null, T(n.matches, (e, t) => (x(), o("div", {
			key: t,
			class: "sp-go-result-heading",
			innerHTML: b(e)
		}, null, 8, gn))), 128))])], 42, fn))), 128))])) : u.value && !/^\d*$/.test(u.value) ? (x(), o("div", _n, " No slides match \"" + k(u.value) + "\" ", 1)) : a("", !0)])]));
	}
});
//#endregion
//#region src/export.ts
async function yn() {
	let e = document.getElementById("sp-content");
	if (!e) throw Error("Export failed: #sp-content not found");
	let t = e.textContent?.trim() || "";
	t = xe(t);
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
	let a = `<template id="sp-cache">${ze().replace(/</g, "&lt;")}</template>`, o = {};
	for (let [e, t] of Object.entries(ce)) t != null && (o[e] = t);
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
var bn = null, xn = null;
async function Sn() {
	if (!bn) return xn || (xn = (async () => {
		try {
			let { createHighlighter: e } = await import("shiki");
			bn = await e({
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
			bn = null;
		}
	})(), xn);
}
function Cn(e) {
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
async function wn(e) {
	if (await Sn(), !bn) return e;
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.querySelectorAll("pre");
	for (let e of n) {
		let t = e.querySelector("code");
		if (!t) continue;
		let n = Cn(t);
		if (!n) continue;
		let r = t.textContent || "";
		try {
			e.outerHTML = bn.codeToHtml(r, {
				lang: n,
				theme: "dark-plus"
			});
		} catch {}
	}
	return t.innerHTML;
}
//#endregion
//#region src/composables/useChunklets.ts
function Tn(e) {
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
function En(e) {
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
function Dn(e, t) {
	return e.replace(/\$(\w+)/g, (e, n) => n in t ? String(t[n]) : `$${n}`);
}
function On(e) {
	if (e.params.length === 0) return "instant";
	let t = e.params.includes("w"), n = e.params.includes("h");
	return t || n ? "drag" : "click";
}
function kn() {
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
var An = ["data-source-file-push"], jn = { class: "sp-global-error" }, Mn = {
	key: 0,
	class: "sp-loading"
}, Nn = { class: "sp-global-top" }, Pn = { class: "sp-global-bottom" }, Fn = { class: "sp-slide-footer" }, In = { class: "sp-chunklet-hint" }, Ln = { class: "sp-nav-bar" }, Rn = ["title"], zn = ["disabled"], Bn = ["disabled"], Vn = {
	key: 0,
	class: "sp-nav-more-menu"
}, Hn = { class: "sp-nav-more-icon" }, Un = { class: "sp-nav-more-item sp-nav-more-browse" }, Wn = { class: "sp-nav-pills" }, Gn = {
	key: 0,
	class: "sp-nav-pill-ellipsis"
}, Kn = ["onClick", "aria-label"], qn = {
	key: 1,
	class: "sp-chunklets-bar"
}, Jn = ["onClick"], Yn = { class: "sp-chunklets-bar-badge" }, Xn = { class: "sp-progress" }, Zn = /* @__PURE__ */ d({
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
		let u = t, { slides: f, currentIndex: p, current: g, total: C, goTo: j, nextSlide: M, prevSlide: ne, setSlides: re } = se(u.slides), { stepIndex: I, totalSteps: L, isFirstStep: R, isLastStep: z, nextStep: ie, prevStep: ce } = De(), V = !1, H = null, le = w(0), U = O(null), ue = O(null);
		P(() => u.raw?.before, (e) => {
			if (!e) {
				U.value = null;
				return;
			}
			U.value = d({
				template: `<div style="display:contents" class="sp-raw-before">${e}</div>`,
				components: u.components
			});
		}, { immediate: !0 }), P(() => u.raw?.after, (e) => {
			if (!e) {
				ue.value = null;
				return;
			}
			ue.value = d({
				template: `<div style="display:contents" class="sp-raw-after">${e}</div>`,
				components: u.components
			});
		}, { immediate: !0 });
		let { openPresenterWindow: de, closePresenter: fe, presenterActive: pe, syncState: me, syncBlackout: he, send: K, onMessage: _e, channel: ve } = ft(), { transformStyle: ye, containerStyle: be } = pt(u.designWidth, u.designHeight), we = w(null), q = w(null);
		S("stepIndex", I), S("slideIndex", p), S("contentVersion", le), S("slides", f), S("goTo", j), S("sp-components", u.components);
		let J = w(u.rawSlideSources ?? f.value.map((e) => e.html));
		S("rawSlideSources", J);
		let Te = w(1), Ee = w(!1), X = n(() => window.location.pathname);
		P(p, (e, t) => {
			e !== t && (Te.value = e > t ? 1 : -1, Ee.value = !0);
		});
		let Oe = n(() => {
			let e = g.value?.transition ?? u.transition;
			return e === "" ? "none" : e;
		}), ke = n(() => {
			let e = `sp-${Oe.value}`;
			return Oe.value === "none" ? e : `${e} sp-dir-${Te.value === 1 ? "forward" : "backward"}`;
		}), Ae = n(() => Oe.value === "none" ? 0 : g.value?.transitionDuration ?? u.transitionDuration), je = n(() => ({
			"--sp-design-width": `${u.designWidth}px`,
			"--sp-design-height": `${u.designHeight}px`,
			"--sp-transition-duration": `${Ae.value}ms`
		}));
		b(() => {
			Oe.value === "none" || !Ee.value || !q.value || (Ee.value = !1, q.value.classList.add("sp-swapping"), q.value.offsetHeight, q.value.classList.remove("sp-swapping"));
		});
		let Me = n(() => p.value === 0), Ne = n(() => p.value === C.value - 1), Z = n(() => C.value === 0 ? 0 : (p.value + 1) / C.value * 100), Pe = n(() => {
			let e = Le.value;
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
		}), Fe = n(() => {
			let e = f.value.map((e, t) => e.fakeEnd ? t : -1).filter((e) => e >= 0), t = C.value - 1;
			return t >= 0 && !e.includes(t) && e.push(t), e.sort((e, t) => e - t);
		}), Ie = n(() => Fe.value.find((e) => e >= p.value) ?? C.value - 1), Le = n(() => Ie.value + 1), Re = n(() => {
			let e = g.value;
			return e ? Y(e.html).html : "";
		});
		function ze() {
			z.value ? p.value < C.value - 1 && M() : ie();
		}
		function Be() {
			R.value ? p.value > 0 && ne() : ce();
		}
		let Ve = n(() => p.value === 0 ? null : f.value[p.value - 1] ?? null), He = n(() => Ve.value ? Y(Ve.value.html).html : ""), Ue = n(() => Ve.value ? Y(Ve.value.html).steps : 0), We = n(() => p.value >= C.value - 1 ? null : f.value[p.value + 1] ?? null), Ge = n(() => We.value ? Y(We.value.html).html : "");
		function Ke() {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}
		function qe() {
			pe.value ? fe() : de();
		}
		let Q = vt();
		B.config = Q;
		let Ye = w(!1), Xe = w(!1), $ = w(!1), Ze = w(!0), Qe = w(!1), $e = w(null);
		function et(e) {
			let t = document.documentElement;
			e === "auto" ? t.removeAttribute("data-dark-mode") : t.dataset.darkMode = e;
		}
		function tt() {
			Q.darkMode = Q.darkMode === "dark" ? "light" : "dark";
		}
		let nt = n(() => Q.darkMode === "dark" ? "Dark" : "Light"), rt = n(() => Q.darkMode === "dark" ? "●" : "○");
		P(() => Q.darkMode, et, { immediate: !0 }), ee(() => {
			B.navLocked = Q.navLocked, B.currentIndex = p.value, B.stepIndex = I.value, B.total = C.value, B.effectiveLast = Ie.value, B.effectiveTotal = Le.value, B.fakeEndIndices = Fe.value;
		}), B.toggleNavLock = () => {
			Q.navLocked = !Q.navLocked;
		}, B.goTo = j, B.next = ze, B.prev = Be, B.nextSlide = M, B.prevSlide = ne, B.export = yn;
		let it = n(() => ({
			width: u.designWidth * Q.overviewScale + "px",
			height: u.designHeight * Q.overviewScale + "px"
		})), at = n(() => ({
			transform: `scale(${Q.overviewScale})`,
			transformOrigin: "top left",
			width: u.designWidth + "px",
			height: u.designHeight + "px"
		})), ot = n(() => f.value.map((e) => Y(e.html).html)), st = n(() => f.value.map((e) => {
			let t = document.createElement("div");
			t.innerHTML = e.html;
			let n = t.querySelector("h1,h2,h3");
			return n ? parseInt(n.tagName[1]) : 0;
		}));
		function ct(e) {
			Ye.value = !1, H = 0, j(e);
		}
		let lt = w(!1);
		function ut() {
			lt.value = !0;
		}
		function mt() {
			lt.value = !1;
		}
		function ht(e) {
			mt(), j(e);
		}
		P(g, (e, t) => {
			L.value = Y(e.html).steps, t?.num !== e?.num && (H === null ? V ? (I.value = Math.min(Math.max(I.value, 0), Math.max(0, L.value - 1)), V = !1) : Te.value === -1 ? I.value = Math.max(0, L.value - 1) : I.value = 0 : (I.value = Math.min(Math.max(H, 0), Math.max(0, L.value - 1)), H = null));
		});
		let gt = w(!1);
		P([p, I], () => {
			gt.value || me(p.value, I.value);
		}, { flush: "post" }), P([p, I], () => {
			u.presenter || _t();
		}, { flush: "post" });
		function _t() {
			let e = `#${p.value}/${I.value}`;
			history.replaceState(null, "", e);
		}
		function yt() {
			let e = location.hash.match(/^#(\d+)(?:\/(\d+))?$/);
			if (!e) return;
			let t = parseInt(e[1], 10), n = e[2] === void 0 ? 0 : parseInt(e[2], 10);
			t >= 0 && t < C.value && (t !== p.value && (V = !0), j(t), I.value = n);
		}
		function bt() {
			yt();
		}
		_e("sync", (e) => {
			gt.value = !0, e.slide !== p.value && (V = !0), j(e.slide), I.value = e.step, m(() => {
				gt.value = !1;
			});
		}), _e("presenter-ready", () => {
			me(p.value, I.value);
		}), _e("presenter-close", () => {
			fe();
		}), _e("blackout", (e) => {
			$.value = e.active;
		}), u.presenter && (K("presenter-ready"), window.addEventListener("beforeunload", () => {
			K("presenter-close");
		}));
		function St() {
			$.value = !$.value, he($.value);
		}
		function Ct() {
			$.value && ($.value = !1, he(!1));
		}
		let wt = [...W._keymapSetups];
		W.applyAnimRegistrations();
		let { rebuildKeymap: Tt } = dt({
			next: ze,
			prev: Be,
			goTo: j,
			goToPrevBegin: Ot,
			goToNextBegin: At,
			goToPrevEnd: kt,
			goToNextEnd: jt,
			currentIndex: p,
			current: g,
			total: C,
			nextStep: ie,
			prevStep: ce,
			stepIndex: I,
			totalSteps: L,
			isLastStep: z,
			isFirstStep: R,
			onPresenterToggle: qe,
			onOverviewToggle: () => Ye.value = !Ye.value,
			onOverviewExit: () => {
				Ye.value = !1;
			},
			onGoPrompt: ut,
			onBlackoutToggle: St,
			onBlackoutExit: Ct,
			onDevPaneToggle: () => {
				Q.proMode ? Mt() : tt();
			},
			onChunkBarToggle: Rt
		}, {
			getContext: () => ({
				overview: Ye.value,
				presenter: pe.value,
				blackout: $.value,
				devPane: Xe.value,
				dragging: B.dragging,
				goPrompt: lt.value
			}),
			extraSetups: wt
		});
		v(() => {
			g.value && (L.value = Y(g.value.html).steps), u.presenter ? Ze.value = !1 : (yt(), m(() => {
				_t(), Ze.value = !1;
			}), window.addEventListener("hashchange", bt)), document.addEventListener("click", Nt, !0), Et(u.seed), Dt();
		});
		function Et(e) {
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
		async function Dt() {
			for (let e = 0; e < f.value.length; e++) {
				let t = f.value[e], n = await wn(t.html);
				n !== t.html && (f.value[e] = {
					...t,
					html: n
				});
			}
		}
		y(() => {
			document.removeEventListener("click", Nt, !0), window.removeEventListener("hashchange", bt), window.removeEventListener("keydown", Yt);
		});
		function Ot() {
			I.value > 0 ? I.value = 0 : p.value > 0 && (H = 0, j(p.value - 1));
		}
		function kt() {
			p.value > 0 && j(p.value - 1);
		}
		function At() {
			p.value < C.value - 1 && (H = 0, j(p.value + 1));
		}
		function jt() {
			I.value < L.value - 1 ? I.value = Y(f.value[p.value].html).steps - 1 : p.value < C.value - 1 && (H = Math.max(0, Y(f.value[p.value + 1].html).steps - 1), j(p.value + 1));
		}
		function Mt() {
			Xe.value = !Xe.value;
		}
		function Nt(e) {
			Qe.value && $e.value && !$e.value.contains(e.target) && (Qe.value = !1);
		}
		let Pt = n(() => {
			let e = B.selectedChunklet;
			return e ? On(e) : "click";
		});
		function Ft(e) {
			let t = e.currentTarget;
			if (!t) return {
				x: 0,
				y: 0
			};
			let n = t.getBoundingClientRect(), r = kn();
			return {
				x: Math.round((e.clientX - n.left) / r),
				y: Math.round((e.clientY - n.top) / r)
			};
		}
		function It(e, t) {
			if (!e) return;
			let n = p.value, r = f.value[n];
			if (e.kind === "typst") {
				let i = Dn(e.html, t), a = `<div class="sp-chunklet-placeholder">chunklet: ${e.name}</div>`;
				f.value = f.value.map((e, t) => t === n ? {
					...e,
					html: e.html + "\n" + a
				} : e), J.value[n] && (J.value = J.value.map((e, t) => t === n ? e + "\n" + a : e)), L.value = Y(g.value.html).steps, le.value++, B.chunkletMode = !1, B.selectedChunklet = null, zt(i, r.editableIndex, e, {
					file: r.sourceFile,
					sourceLine: r.sourceLine
				});
				return;
			}
			let i = Dn(e.html, t), a = r.html;
			f.value = f.value.map((e, t) => t === n ? {
				...e,
				html: a + "\n" + i
			} : e), J.value[n] && (J.value = J.value.map((e, t) => t === n ? e + "\n" + i : e)), L.value = Y(g.value.html).steps, le.value++, B.chunkletMode = !1, B.selectedChunklet = null, zt(i, r.editableIndex);
		}
		function Lt(e) {
			if (B.selectedChunklet === e && B.chunkletMode) {
				Jt();
				return;
			}
			B.selectedChunklet = e, B.chunkletMode = !0;
		}
		function Rt() {
			B.showChunkletsBar = !B.showChunkletsBar;
		}
		function zt(e, t, n, r) {
			let i = q.value?.querySelector(".sp-slide-current");
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
			let a = q.value?.querySelector(".sp-slide-current [data-source-file-push] + *") ?? i, o = i ? Je(a) : null;
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
		let Bt = w({
			x: 0,
			y: 0
		}), Vt = w({
			x: 0,
			y: 0
		}), Ut = w(!1), Wt = n(() => {
			let e = Math.min(Bt.value.x, Vt.value.x), t = Math.min(Bt.value.y, Vt.value.y), n = Math.abs(Vt.value.x - Bt.value.x), r = Math.abs(Vt.value.y - Bt.value.y);
			return {
				left: e + "px",
				top: t + "px",
				width: n + "px",
				height: r + "px"
			};
		});
		function Gt(e) {
			e.preventDefault(), Bt.value = Ft(e), Vt.value = { ...Bt.value }, Ut.value = !0;
		}
		function Kt(e) {
			Ut.value && (Vt.value = Ft(e));
		}
		function qt(e) {
			if (!Ut.value) return;
			Ut.value = !1;
			let t = B.selectedChunklet;
			if (!t) return;
			let n = On(t), r = Bt.value, i = Vt.value, a = Math.abs(i.x - r.x), o = Math.abs(i.y - r.y);
			n === "drag" && !(a < 5 && o < 5) ? It(t, {
				x: Math.min(r.x, i.x),
				y: Math.min(r.y, i.y),
				w: Math.abs(i.x - r.x),
				h: Math.abs(i.y - r.y)
			}) : It(t, {
				x: r.x,
				y: r.y
			});
		}
		function Jt() {
			B.chunkletMode = !1, B.selectedChunklet = null, Ut.value = !1;
		}
		P(() => B.chunkletMode, (e) => {
			e ? window.addEventListener("keydown", Yt) : window.removeEventListener("keydown", Yt);
		});
		function Yt(e) {
			e.key === "Escape" && Jt();
		}
		function Xt(e) {
			J.value = oe(e);
			let t = Ce(Se(xe(e))), n = document.createElement("div");
			n.innerHTML = t;
			let r = ae(n);
			if (r.length === 0) return;
			let i = p.value, a = I.value, o = Math.min(i, r.length - 1);
			V = !0, re(r), p.value = o, L.value = Y(g.value.html).steps, o === i ? (I.value = Math.min(a, L.value - 1), V = !1) : I.value = 0, Dt().then(() => {
				le.value++;
			});
		}
		return r({ updateSlides: Xt }), (n, r) => (x(), o("div", {
			class: h(["sp-presentation", { "sp-presenter-mode": t.presenter }]),
			style: _(je.value)
		}, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": X.value
			}, null, 8, An),
			u.raw?.before ? (x(), i(D(U.value), { key: 0 })) : a("", !0),
			A(G).length > 0 ? (x(), o("div", {
				key: 1,
				class: "sp-global-error-overlay",
				onClick: r[0] ||= F((e) => A(ge)(), ["self"])
			}, [s("div", jn, [r[14] ||= s("h3", null, "Global Errors", -1), s("ul", null, [(x(!0), o(e, null, T(A(G), (e, t) => (x(), o("li", { key: t }, k(e), 1))), 128))])])])) : a("", !0),
			t.presenter ? (x(), i(nn, {
				key: 3,
				current: A(g),
				currentIndex: A(p),
				total: A(C),
				activeHtml: Re.value,
				components: u.components,
				progressPercent: Z.value,
				blackout: $.value,
				exitBlackout: Ct,
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
				Ze.value ? (x(), o("div", Mn, [...r[15] ||= [s("div", { class: "sp-loading-text" }, "Loading…", -1)]])) : a("", !0),
				te(s("div", {
					class: "sp-viewport",
					style: _(A(be)),
					ref_key: "viewportEl",
					ref: we
				}, [s("div", {
					class: "sp-scale-wrap",
					style: _(A(ye))
				}, [
					s("div", Nn, [E(n.$slots, "global-top")]),
					s("div", {
						class: h(ke.value),
						ref_key: "transitionWrapEl",
						ref: q
					}, [
						Ve.value ? (x(), i(xt, {
							class: "sp-slide-prev",
							key: A(p) - 1,
							slide: Ve.value,
							html: He.value,
							fixedStep: Ue.value - 1,
							components: u.components
						}, null, 8, [
							"slide",
							"html",
							"fixedStep",
							"components"
						])) : a("", !0),
						A(g) ? (x(), i(xt, {
							class: "sp-slide-current",
							key: A(p),
							slide: A(g),
							html: Re.value,
							components: u.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0),
						We.value ? (x(), i(xt, {
							class: "sp-slide-next",
							key: A(p) + 1,
							slide: We.value,
							html: Ge.value,
							fixedStep: 0,
							components: u.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0)
					], 2),
					s("div", Pn, [E(n.$slots, "global-bottom", {}, () => [s("footer", Fn, [s("span", null, k(A(p) + 1) + " / " + k(Le.value), 1), s("span", null, k(t.author), 1)])])]),
					A(B).chunkletMode ? (x(), o("div", {
						key: 0,
						class: h(["sp-chunklet-overlay", { "sp-chunklet-drag": Pt.value === "drag" }]),
						onPointerdown: Gt,
						onPointermove: Kt,
						onPointerup: qt
					}, [s("div", In, [c(k(Pt.value === "drag" ? "Click + drag to draw " + A(B).selectedChunklet?.name : Pt.value === "click" ? "Click to place " + A(B).selectedChunklet?.name : "Click to insert " + A(B).selectedChunklet?.name) + " ", 1), r[16] ||= s("span", { class: "sp-chunklet-hint-esc" }, "ESC to cancel", -1)]), Ut.value ? (x(), o("div", {
						key: 0,
						class: "sp-chunklet-preview",
						style: _(Wt.value)
					}, null, 4)) : a("", !0)], 34)) : a("", !0)
				], 4)], 4), [[N, !Ze.value]]),
				s("nav", { class: h(["sp-nav", { locked: A(Q).navLocked }]) }, [s("div", Ln, [
					s("button", {
						class: h(["sp-nav-btn sp-nav-lock", { locked: A(Q).navLocked }]),
						title: A(Q).navLocked ? "Unlock nav" : "Lock nav visible",
						onClick: r[1] ||= (e) => A(Q).navLocked = !A(Q).navLocked
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
					})], -1)]], 10, Rn),
					s("button", {
						class: "sp-nav-btn",
						disabled: Me.value && A(R),
						"aria-label": "Previous",
						onClick: Be
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
					})], -1)]], 8, zn),
					s("span", {
						class: "sp-nav-counter",
						onClick: ut
					}, k(A(p) + 1) + " / " + k(Le.value), 1),
					s("button", {
						class: "sp-nav-btn",
						disabled: Ne.value && A(z),
						"aria-label": "Next",
						onClick: ze
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
					})], -1)]], 8, Bn),
					s("button", {
						class: "sp-nav-btn sp-fullscreen-btn",
						"aria-label": "Toggle fullscreen",
						title: "Fullscreen (F)",
						onClick: Ke
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
						class: h(["sp-nav-btn", { active: A(pe) }]),
						"aria-label": "Toggle presenter",
						title: "Presenter (P)",
						onClick: qe
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
						ref: $e
					}, [s("button", {
						class: h(["sp-nav-btn sp-nav-more-btn", { active: Qe.value }]),
						"aria-label": "More options",
						title: "More…",
						onClick: r[2] ||= (e) => Qe.value = !Qe.value
					}, "⋯", 2), Qe.value ? (x(), o("div", Vn, [
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[3] ||= (e) => {
								tt(), Qe.value = !1;
							}
						}, [s("span", Hn, k(rt.value), 1), c(" " + k(nt.value), 1)]),
						r[29] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[4] ||= (e) => {
								Mt(), Qe.value = !1;
							}
						}, [...r[22] ||= [s("span", { class: "sp-nav-more-icon" }, "◇", -1), c(" Dev tools ", -1)]]),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[5] ||= (e) => {
								Ye.value = !Ye.value, Qe.value = !1;
							}
						}, [...r[23] ||= [s("span", { class: "sp-nav-more-icon" }, "⊞", -1), c(" Overview ", -1)]]),
						s("button", {
							class: h(["sp-nav-more-item", { active: A(B).showChunkletsBar }]),
							onClick: r[6] ||= (e) => {
								Rt(), Qe.value = !1;
							}
						}, [...r[24] ||= [s("span", { class: "sp-nav-more-icon" }, "▤", -1), c(" Chunks ", -1)]], 2),
						r[30] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[7] ||= (e) => St()
						}, [s("span", { class: h(["sp-nav-more-icon sp-nav-more-icon-blackout", { active: $.value }]) }, "●", 2), r[25] ||= c(" Blackout ", -1)]),
						s("div", Un, [
							s("button", {
								class: "sp-nav-more-browse-btn",
								title: "End of previous slide (A)",
								onClick: r[8] ||= (e) => kt()
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
							r[28] ||= c(" | ", -1),
							s("button", {
								class: "sp-nav-more-browse-btn",
								title: "End of next slide (Z)",
								onClick: r[9] ||= (e) => jt()
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
				]), s("div", Wn, [(x(!0), o(e, null, T(Pe.value, (t) => (x(), o(e, { key: t.type === "pill" ? "p" + t.index : t.id }, [t.type === "ellipsis" ? (x(), o("span", Gn, "…")) : (x(), o("button", {
					key: 1,
					class: h(["sp-nav-pill", {
						active: t.index === A(p),
						"sp-nav-pill-h1": st.value[t.index] === 1,
						"sp-nav-pill-h2": st.value[t.index] === 2,
						"sp-nav-pill-h3": st.value[t.index] === 3
					}]),
					onClick: (e) => {
						A(j)(t.index), I.value = 0;
					},
					"aria-label": "Go to slide " + (t.index + 1)
				}, null, 10, Kn))], 64))), 128))])], 2),
				A(B).showChunkletsBar && A(B).chunkletDefs.length ? (x(), o("div", qn, [(x(!0), o(e, null, T(A(B).chunkletDefs, (e) => (x(), o("button", {
					key: e.name,
					class: h(["sp-chunklets-bar-btn", { active: A(B).selectedChunklet === e }]),
					onClick: (t) => Lt(e)
				}, [c(k(e.name) + " ", 1), s("span", Yn, k(A(On)(e)), 1)], 10, Jn))), 128)), s("button", {
					class: "sp-chunklets-bar-btn",
					onClick: r[10] ||= (e) => A(B).showChunkletsBar = !A(B).showChunkletsBar
				}, "×")])) : a("", !0),
				s("div", Xn, [s("div", {
					class: "sp-progress-bar",
					style: _({ width: Z.value + "%" })
				}, null, 4)]),
				$.value ? (x(), o("div", {
					key: 2,
					class: "sp-main-blackout",
					onClick: r[11] ||= (e) => $.value = !1
				}, [...r[31] ||= [s("span", { class: "sp-main-blackout-hint" }, "click to dismiss", -1)]])) : a("", !0)
			], 64)),
			Ye.value ? (x(), i(cn, {
				key: 4,
				slides: A(f),
				currentIndex: A(p),
				slideHeadingLevels: st.value,
				overviewHtmls: ot.value,
				overviewThumbStyle: it.value,
				overviewSlideStyle: at.value,
				components: u.components,
				onClose: r[12] ||= (e) => Ye.value = !1,
				onSelect: ct
			}, null, 8, [
				"slides",
				"currentIndex",
				"slideHeadingLevels",
				"overviewHtmls",
				"overviewThumbStyle",
				"overviewSlideStyle",
				"components"
			])) : a("", !0),
			l(Ht, {
				visible: Xe.value,
				"export-fn": A(B).export,
				onClose: r[13] ||= (e) => Xe.value = !1
			}, null, 8, ["visible", "export-fn"]),
			lt.value ? (x(), i(vn, {
				key: 5,
				slides: A(f),
				overviewHtmls: ot.value,
				designWidth: u.designWidth,
				designHeight: u.designHeight,
				components: u.components,
				total: A(C),
				onClose: mt,
				onSelect: ht
			}, null, 8, [
				"slides",
				"overviewHtmls",
				"designWidth",
				"designHeight",
				"components",
				"total"
			])) : a("", !0),
			u.raw?.after ? (x(), i(D(ue.value), { key: 6 })) : a("", !0)
		], 6));
	}
}), Qn = /* @__PURE__ */ d({
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
}), $n = /* @__PURE__ */ d({
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
				let e = U(n[1]);
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
					let t = U(r[1]);
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
				let r = B._animActionTypes[n.type];
				if (r) if (n.delayedBy && !t) setTimeout(() => {
					try {
						r.apply(i, n);
					} catch (t) {
						console.error("(Caught) Error applying anim action:", t), K(`Error applying anim action at step ${e}: ${t}`);
					}
				}, n.delayedBy);
				else try {
					r.apply(i, n);
				} catch (t) {
					console.error("(Caught) Error applying anim action:", t), K(`Error applying anim action at step ${e}: ${t}`);
				}
			}
		}
		function _(e) {
			let t = d(), n = p.value[e - t - 1];
			if (!n) return;
			let r = m();
			for (let e of n) {
				let t = B._animActionTypes[e.type];
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
				B._animActionTypes[n.type]?.init?.(t, n);
			} catch (e) {
				console.error("(Caught) Error initializing anim action:", e), K(`Error initializing anim action: ${e}`);
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
}), er = ["data-debug"], tr = {
	key: 0,
	class: "sp-drag-edit-overlay"
}, nr = ["onMousedown", "onTouchstart"], rr = ["title"], ir = /*@__PURE__*/ d({
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
			k(), l.value && (g.value === "auto" && (g.value = l.value.offsetWidth || 200), b.value === "auto" && (b.value = l.value.offsetHeight || 100)), u.value = !0, B.dragging = !0, window.addEventListener("keydown", A);
		}
		function M() {
			u.value = !1, B.dragging = !1, window.removeEventListener("keydown", A);
		}
		function N() {
			let e = P(), t = P(!0);
			if (t === e) {
				M();
				return;
			}
			let n = !!i.at, a = l.value?.getAttribute("data-drag-id"), o = l.value?.getAttribute("data-source-line"), s = l.value?.getAttribute("data-source-file") || Je(l.value);
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
		function ne() {
			u.value ? N() : j();
		}
		let re = (e) => typeof e == "number" || /^\d+(\.\d+)?$/.test(e) ? e + "px" : e, I = n(() => ({
			position: "absolute",
			left: re(p.value),
			top: re(m.value),
			width: re(g.value),
			height: re(b.value),
			transform: S.value ? `rotate(${S.value}deg)` : void 0
		})), L = !1, R = 0, z = 0, ie = 0, ae = 0, oe = 0;
		function se(e) {
			return "touches" in e ? {
				clientX: e.touches[0].clientX,
				clientY: e.touches[0].clientY
			} : {
				clientX: e.clientX,
				clientY: e.clientY
			};
		}
		let ce = 0;
		function V(e) {
			if (u.value) {
				e.preventDefault(), le(e);
				return;
			}
			let t = Date.now();
			if (t - ce < 300) {
				e.preventDefault(), ne(), ce = 0;
				return;
			}
			ce = t;
		}
		function H() {
			L && (L = !1, document.removeEventListener("mousemove", U), document.removeEventListener("mouseup", H), document.removeEventListener("touchmove", U), document.removeEventListener("touchend", H), setTimeout(() => oe--, 0));
		}
		function le(e) {
			if (!u.value) return;
			J(), L = !0, oe++;
			let { clientX: t, clientY: n } = se(e);
			R = t, z = n, ie = p.value, ae = m.value, document.addEventListener("mousemove", U), document.addEventListener("mouseup", H), document.addEventListener("touchmove", U, { passive: !1 }), document.addEventListener("touchend", H);
		}
		function U(e) {
			if (!L) return;
			e.preventDefault();
			let t = D(), { clientX: n, clientY: r } = se(e), i = (n - R) / t, a = (r - z) / t;
			p.value = ie + i, m.value = ae + a;
		}
		let ue = !1, de = "", fe = 0, pe = 0, me = 0, W = 0, he = 0, G = 0;
		function K() {
			ue && (ue = !1, document.removeEventListener("mousemove", _e), document.removeEventListener("mouseup", K), document.removeEventListener("touchmove", _e), document.removeEventListener("touchend", K), setTimeout(() => oe--, 0));
		}
		function ge(e, t) {
			if (!u.value) return;
			J(), ue = !0, oe++;
			let { clientX: n, clientY: r } = se(e);
			de = t, fe = n, pe = r, me = p.value, W = m.value, he = C(g.value), G = C(b.value), document.addEventListener("mousemove", _e), document.addEventListener("mouseup", K), document.addEventListener("touchmove", _e, { passive: !1 }), document.addEventListener("touchend", K);
		}
		function _e(e) {
			if (!ue) return;
			e.preventDefault();
			let t = D(), { clientX: n, clientY: r } = se(e), i = (n - fe) / t, a = (r - pe) / t, o = me, s = W, c = he, l = G;
			switch (de) {
				case "n":
					s = W + a, l = G - a;
					break;
				case "s":
					l = G + a;
					break;
				case "e":
					c = he + i;
					break;
				case "w":
					o = me + i, c = he - i;
					break;
				case "ne":
					s = W + a, l = G - a, c = he + i;
					break;
				case "nw":
					o = me + i, s = W + a, c = he - i, l = G - a;
					break;
				case "se":
					c = he + i, l = G + a;
					break;
				case "sw":
					o = me + i, c = he - i, l = G + a;
					break;
			}
			c < 10 && (c = 10), l < 10 && (l = 10), p.value = o, m.value = s, g.value = c, b.value = l;
		}
		let ve = !1, ye = 0, be = 0, xe = 0, Se = 0;
		function Ce() {
			ve && (ve = !1, document.removeEventListener("mousemove", q), document.removeEventListener("mouseup", Ce), document.removeEventListener("touchmove", q), document.removeEventListener("touchend", Ce), setTimeout(() => oe--, 0));
		}
		function we(e) {
			if (!u.value) return;
			J(), ve = !0, oe++;
			let t = l.value.getBoundingClientRect(), { clientX: n, clientY: r } = se(e);
			ye = t.left + t.width / 2, be = t.top + t.height / 2, xe = Math.atan2(r - be, n - ye), Se = S.value, document.addEventListener("mousemove", q), document.addEventListener("mouseup", Ce), document.addEventListener("touchmove", q, { passive: !1 }), document.addEventListener("touchend", Ce);
		}
		function q(e) {
			if (!ve) return;
			e.preventDefault();
			let { clientX: t, clientY: n } = se(e), r = Math.atan2(n - be, t - ye) - xe;
			S.value = Se + 180 / Math.PI * r;
		}
		function J() {
			H(), K(), Ce();
		}
		k(), v(() => {
			document.addEventListener("click", Te);
		}), y(() => {
			document.removeEventListener("click", Te);
		});
		function Te(e) {
			u.value && (oe > 0 || l.value && (l.value.contains(e.target) || N()));
		}
		return (n, r) => (x(), o("div", {
			ref_key: "el",
			ref: l,
			class: h(["sp-drag", { "sp-drag-editing": u.value }]),
			style: _(I.value),
			onDblclick: ne,
			onMousedown: le,
			onTouchstart: V,
			"data-debug": t.editableIndex
		}, [s("div", { class: h(["sp-drag-content", { "sp-drag-content-blocked": u.value }]) }, [E(n.$slots, "default", {}, void 0, !0)], 2), u.value ? (x(), o("div", tr, [
			r[1] ||= s("div", { class: "sp-drag-edit-border" }, null, -1),
			(x(), o(e, null, T(d, (e) => s("div", {
				key: e,
				class: h(["sp-drag-handle", "sp-handle-" + e]),
				onMousedown: F((t) => ge(t, e), ["stop"]),
				onTouchstart: F((t) => ge(t, e), ["stop", "prevent"])
			}, null, 42, nr)), 64)),
			r[2] ||= s("div", { class: "sp-drag-rotate-line" }, null, -1),
			s("div", {
				class: "sp-drag-rotate-handle",
				onMousedown: F(we, ["stop"]),
				onTouchstart: F(we, ["stop", "prevent"])
			}, null, 32),
			s("button", {
				class: "sp-drag-save-btn",
				title: te.value,
				onMousedown: r[0] ||= F(() => {}, ["stop"]),
				onClick: F(N, ["stop"])
			}, " Save ", 40, rr)
		])) : a("", !0)], 46, er));
	}
}), ar = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, or = /*#__PURE__*/ ar(ir, [["__scopeId", "data-v-7b3a8916"]]), sr = ["src", "alt"], cr = {
	key: 1,
	class: "sp-img-loading"
}, lr = /*#__PURE__*/ ar(/* @__PURE__ */ d({
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
				let t = Fe(e);
				if (t.value) {
					n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
					return;
				}
				try {
					if (await Le(e), t.value) {
						n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
						return;
					}
				} catch {}
				n.value = e;
				return;
			}
			let r = Ie(e);
			if (r.value) {
				n.value = r.value;
				return;
			}
			try {
				if (await Re(e), r.value) {
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
		}, null, 14, sr)) : (x(), o("span", cr, "…"));
	}
}), [["__scopeId", "data-v-9678aed9"]]), ur = /* @__PURE__ */ d({
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
}), dr = /* @__PURE__ */ d({
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
function fr(e) {
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
var pr = {
	key: 0,
	class: "sp-toc"
}, mr = {
	key: 0,
	class: "sp-toc-section"
}, hr = ["onClick"], gr = { class: "sp-toc-text" }, _r = /* @__PURE__ */ d({
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
		}, c = f("slides"), l = f("slideIndex"), u = f("goTo"), { tree: d } = fr(n(() => c.value)), p = n(() => l.value + i(r.highlight)), m = n(() => {
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
		return (t, n) => m.value.length ? (x(), o("nav", pr, [E(t.$slots, "default", {
			items: m.value,
			currentIndex: A(l).value,
			goTo: A(u),
			activeSection: g.value
		}, () => [r.context && g.value ? (x(), o("div", mr, k(g.value.text), 1)) : a("", !0), s("ol", null, [(x(!0), o(e, null, T(m.value, (e) => (x(), o("li", {
			key: e.slideIndex,
			class: h(["sp-toc-h" + e.level, { "sp-toc-active": e.slideIndex === p.value }]),
			onClick: (t) => A(u)(e.slideIndex)
		}, [s("span", gr, k(e.text), 1)], 10, hr))), 128))])])])) : a("", !0);
	}
}), vr = 1, yr = {
	"": 1,
	px: 1,
	cm: 96 / 2.54,
	mm: 96 / 10 / 2.54,
	Q: 96 / 40 / 2.54,
	in: 96,
	pc: 96 / 6,
	pt: 96 / 72
};
function br(e) {
	if (!e) return 0;
	let t = e.match(/^([\d.]+)(\w*)$/);
	return t ? parseFloat(t[1]) * (yr[t[2]] ?? 1) : 0;
}
var xr = (e) => {
	let t = e.querySelector("svg");
	if (!t || t.getAttribute("viewBox")) return;
	let n = br(t.getAttribute("width")), r = br(t.getAttribute("height"));
	n && r && (t.setAttribute("viewBox", `0 0 ${n} ${r}`), t.removeAttribute("width"), t.removeAttribute("height"));
}, Sr = (e) => {
	e.querySelectorAll("[*|href]:not([href])").forEach((e) => {
		let t = e.getAttributeNS("http://www.w3.org/1999/xlink", "href");
		t && (e.setAttribute("href", t), e.removeAttributeNS("http://www.w3.org/1999/xlink", "href"));
	});
}, Cr = (e) => {
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
		let i = `svgid-${vr++}`;
		r.id = i;
		for (let { el: t, attr: r } of n[e]) {
			let n = t.getAttribute(r);
			t.setAttribute(r, n.replace("#" + e, "#" + i));
		}
	}
}, wr = (e) => {
	e.querySelectorAll("[style]").forEach((e) => {
		let t = e.getAttribute("style");
		t && (t.split(";").forEach((t) => {
			let n = t.trim();
			if (!n || n.startsWith("-")) return;
			let [r, ...i] = n.split(":").map((e) => e.trim());
			r && i.length && e.setAttribute(r, i.join(":"));
		}), e.removeAttribute("style"));
	});
}, Tr = [
	xr,
	Sr,
	Cr,
	wr
], Er = /*#__PURE__*/ ar(/* @__PURE__ */ d({
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
			let e = [...Tr];
			return t.width != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("width", String(t.width));
			}), t.height != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("height", String(t.height));
			}), e;
		});
		return (t, n) => e.wrap ? (x(), o("div", p({ key: 0 }, t.$attrs, { class: "sp-svg-wrap" }), [l(Fr, {
			src: e.src,
			path: e.path,
			transformers: r.value,
			"no-fix-void": "",
			"no-component": ""
		}, null, 8, [
			"src",
			"path",
			"transformers"
		])], 16)) : (x(), i(Fr, p({ key: 1 }, t.$attrs, {
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
}), [["__scopeId", "data-v-1d4193db"]]), Dr = {
	key: 0,
	class: "sp-slide-source"
}, Or = { class: "sp-slide-source-header" }, kr = ["innerHTML"], Ar = /*#__PURE__*/ ar(/* @__PURE__ */ d({
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
				let e = await wn(a);
				i === d && (u.value = e);
			} catch {
				i === d && (u.value = a);
			}
		}, { immediate: !0 }), (e, t) => u.value ? (x(), o("div", Dr, [s("div", Or, [E(e.$slots, "header", { forSlide: l.value }, () => [c(" Slide " + k(l.value + 1) + " source ", 1)], !0)]), s("div", {
			class: "sp-slide-source-body",
			innerHTML: u.value
		}, null, 8, kr)])) : a("", !0);
	}
}), [["__scopeId", "data-v-8a380df0"]]), jr = ["data-source-file-push"], Mr = ["innerHTML"], Nr = /*@__PURE__*/ d({
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
		let n = f("contentVersion"), r = f("sp-components", {}), a = u(() => Promise.resolve().then(() => Pr)), c = t, l = w(""), h = w(""), _ = O(null), v = w(null);
		y(() => {
			v.value && clearTimeout(v.value);
		});
		function b(e) {
			c.noFixVoid || (e = xe(e)), e = Se(e);
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
					"sp-alternatives": Qn,
					"sp-anim": $n,
					"sp-drag": or,
					"sp-img": lr,
					"sp-include": a,
					"sp-step": ur,
					"sp-style": dr,
					"sp-toc": _r,
					"sp-svg": Er,
					"sp-slide-source": Ar,
					...r
				}
			});
		}
		function C() {
			m(() => {
				n.value++;
			});
		}
		return P(Fe(c.src), async (e) => {
			if (e) v.value &&= (clearTimeout(v.value), null), l.value = "", h.value = b(e), c.noComponent || S(h.value), C();
			else if (e === void 0) {
				if (v.value) return;
				v.value = setTimeout(() => {
					_.value = null, v.value = null;
				}, 500);
				try {
					await Le(c.src);
				} catch (e) {
					l.value = `${e.message} (src: ${c.src})`, v.value &&= (clearTimeout(v.value), null);
				}
			}
		}, { immediate: !0 }), (n, r) => (x(), o(e, null, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": t.src
			}, null, 8, jr),
			l.value ? (x(), o("div", p({ key: 0 }, n.$attrs, { class: "sp-include-error" }), k(l.value), 17)) : c.noComponent ? (x(), o("div", p({ key: 1 }, n.$attrs, {
				class: "sp-include",
				innerHTML: h.value
			}), null, 16, Mr)) : (x(), i(D(_.value), g(p({ key: 2 }, n.$attrs)), null, 16)),
			r[0] ||= s("span", {
				style: { display: "none" },
				"data-source-file-pop": ""
			}, null, -1)
		], 64));
	}
}), Pr = /* @__PURE__ */ I({ default: () => Fr }), Fr = /*#__PURE__*/ ar(Nr, [["__scopeId", "data-v-a3f50969"]]), Ir = {
	"sp-alternatives": Qn,
	"sp-anim": $n,
	"sp-drag": or,
	"sp-img": lr,
	"sp-include": Fr,
	"sp-svg": Er,
	"sp-step": ur,
	"sp-style": dr,
	"sp-toc": _r,
	"sp-slide-source": Ar
};
function Lr(e) {
	return typeof e == "string" ? document.querySelector(e) : e ?? null;
}
async function Rr(e = {}) {
	let { slides: t, el: n, transition: i, transitionDuration: a, designWidth: o, designHeight: s, author: c, components: l, seed: u, cacheIgnore: d, plugins: f, activate: p } = e, m = document.getElementById("sp-content"), h = document.getElementById("sp-cache"), g = {}, _ = null, v = [];
	if (m) {
		let e = await Q(m.textContent || "");
		v.push(...oe(e));
		let t = Ce(Se(xe(e)));
		_ = document.createElement("div"), _.innerHTML = t;
	}
	if (!t) {
		if (h?.content) {
			let e = h.content.textContent?.trim();
			e && Be(e);
		}
		_ && (t = ae(_), i && t.forEach((e) => {
			e.transition === "" && (e.transition = i);
		}));
	}
	_ && ie(_, g);
	let y = document.getElementById("sp-chunklets");
	if (y?.tagName === "SCRIPT") {
		let e = y.textContent || "";
		e.trim() && (B.chunkletDefs = Tn(e));
	}
	if (!o || !s || !c || !u) {
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
	if (d && Me(d), _) {
		x(_);
		let e = [];
		_.querySelectorAll("sp-include").forEach((t) => {
			let n = t.getAttribute("src");
			n && e.push(Le(n));
		});
		let t = /* @__PURE__ */ new Set();
		_.querySelectorAll("img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), _.querySelectorAll("sp-img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), t.forEach((t) => {
			t.match(/\.svg(\?|#|$)/i) ? e.push(Le(t)) : e.push(Re(t));
		}), await Promise.all(e);
	}
	let T = {
		...Ir,
		...l
	}, E = Lr(n) ?? document.getElementById("sp-presentation") ?? document.getElementById("app") ?? document.body, D = new URLSearchParams(window.location.search), O = e.presenter ?? D.has("presenter");
	Object.assign(ce, {
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
	for (let e of A) await W.register(e);
	let j = r(Zn, {
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
	j.config.globalProperties.$sp = B, j.provide("sp-api", B), j.provide("sp-registry", W);
	let M = w(0);
	j.provide("liveUpdatesCount", M), typeof globalThis < "u" && (globalThis.__sp__ = B);
	let N = j.mount(E);
	if (j.use = async (e) => (await W.register(e), N.rebuildKeymap(), j), typeof EventSource < "u" && window.location.hostname === "localhost") {
		let e = new EventSource("/__sp_events"), t = (e) => {
			let t = 0;
			for (let n of e) t = (t << 5) - t + n.charCodeAt(0), t |= 0;
			return t;
		}, n = parseInt(window.localStorage.getItem("sp-non-content-hash") ?? "0", 10);
		e.addEventListener("update", (e) => {
			M.value++;
			let r = (e.data ?? "").trim();
			r ? Ue(r) : He(), fetch(window.location.href + "?_=" + Date.now()).then((e) => e.text()).then((e) => {
				let r = t(e.replace(/<script\s+type="text\/html"\s+id="sp-content">[\s\S]*?<\/script>/, ""));
				if (n !== 0 && n !== r) {
					window.localStorage.setItem("sp-non-content-hash", r.toString()), window.location.reload();
					return;
				}
				n = r;
				let i = e.match(/<script\s+type="text\/html"\s+id="sp-content">([\s\S]*?)<\/script>/);
				i && (async () => {
					let e = await Q(i[1]);
					ge(), N.updateSlides?.(e), C(e);
				})().catch(() => {});
			}).catch(() => {});
		}), e.addEventListener("connected", () => {}, { once: !0 }), e.addEventListener("typst-error", (e) => {
			ge();
			try {
				let t = JSON.parse(e.data ?? "[]");
				(Array.isArray(t) ? t : [t]).forEach((e) => K(e));
			} catch {}
		});
	}
	return j.export = yn, j;
}
//#endregion
export { Qn as SpAlternatives, $n as SpAnim, or as SpDrag, lr as SpImg, Fr as SpInclude, Zn as SpPresentation, xt as SpSlide, Ar as SpSlideSource, dr as SpStyle, Er as SpSvg, _r as SpToc, xr as addViewBox, lt as bind, On as chunkPlacementMode, ut as createDefaultKeymap, Rr as createSlidesPurryst, Tr as defaultTransformers, he as definePlugin, yn as exportStandalone, Cr as idRewrite, me as injectStyle, pe as listAnimActionTypes, de as listAnimCommands, V as parseArgs, En as parseChunklets, Tn as parseChunkletsFromText, ae as parseElementToSlides, Y as processSlideHtml, fe as registerAnimActionType, ue as registerAnimCommand, W as registry, yt as resetConfig, B as spApi, wr as styleToAttributes, Dn as substituteParams, Ut as useElementScale, ct as useKeymap, dt as useNavigation, ft as usePresenter, pt as useScale, fr as useSlideTree, se as useSlides, De as useSteps, vt as useStorage, Sr as xlinkRewrite };
