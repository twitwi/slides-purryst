import { Fragment as e, Teleport as t, computed as n, createApp as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createStaticVNode as c, createTextVNode as l, createVNode as u, defineAsyncComponent as d, defineComponent as f, inject as p, mergeProps as m, nextTick as h, normalizeClass as g, normalizeProps as _, normalizeStyle as v, onMounted as y, onUnmounted as b, onUpdated as x, openBlock as S, provide as C, reactive as w, ref as T, renderList as E, renderSlot as D, resolveDynamicComponent as O, shallowRef as k, toDisplayString as A, unref as j, useSlots as M, vModelText as ee, vShow as te, watch as N, watchEffect as ne, withDirectives as re, withKeys as P, withModifiers as F } from "vue";
//#region \0rolldown/runtime.js
var I = Object.defineProperty, L = (e, t) => {
	let n = {};
	for (var r in e) I(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || I(n, Symbol.toStringTag, { value: "Module" }), n;
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
function ie(e, t) {
	e.querySelectorAll("sp-before").forEach((e) => {
		let n = B(e).trim();
		n && (t.before = (t.before ?? "") + n);
	}), e.querySelectorAll("sp-after").forEach((e) => {
		let n = B(e).trim();
		n && (t.after = (t.after ?? "") + n);
	});
}
function ae(e) {
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
	devServer: !1,
	config: {},
	_animCommands: {},
	_animActionTypes: {},
	overview: !1,
	showChunkletsBar: !1,
	chunkletDefs: [],
	chunkletMode: !1,
	selectedChunklet: null
}), ce = {}, le = /* @__PURE__ */ new Set();
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
var ue = {
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
function de(e, t) {
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
			return de(e, t).map((e) => [e]);
		},
		init(e, t) {
			let n = t.querySelector(e);
			if (n) for (let e of n.children) e.classList.add("sp-anim-hidden"), e.classList.remove("sp-anim-shown");
		}
	},
	child: {
		countSteps: () => 1,
		parse(e) {
			let t = H(e), n = t[0] ?? "";
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
}, V._animActionTypes = { ...ue };
function fe(e) {
	return V._animCommands[e];
}
function pe(e, t) {
	V._animCommands[e] = t;
}
function me() {
	return Object.keys(V._animCommands);
}
function he(e, t) {
	V._animActionTypes[e] = t;
}
function ge() {
	return Object.keys(V._animActionTypes);
}
//#endregion
//#region src/plugin.ts
function _e(e) {
	let t = document.createElement("style");
	t.textContent = e, document.head.appendChild(t);
}
var ve = {
	_plugins: [],
	_keymapSetups: [],
	_animCommands: [],
	_animActionTypes: [],
	_domTransforms: [],
	_slideRefinements: [],
	_teardowns: /* @__PURE__ */ new Map(),
	refineAllSlides(e = document) {
		for (let t of e.querySelectorAll(".sp-slide")) for (let e of this._slideRefinements) e.appliesTo(t) && e.apply(t);
	},
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
			injectStyle: n.includes("style") ? t : _e,
			addChunklet: n.includes("chunklet") ? t : (e) => V.chunkletDefs.push(e),
			addDomTransform: n.includes("domTransform") ? t : (e) => this._domTransforms.push(e),
			addSlideRefinement: n.includes("slideRefinement") ? t : (e) => this._slideRefinements.push(e)
		}, i = e.activate(r), a = i instanceof Promise ? await i : i;
		if (a) {
			let t = this._teardowns.get(e.name) ?? [];
			t.push(a), this._teardowns.set(e.name, t);
		}
	},
	applyAnimRegistrations() {
		for (let { name: e, handler: t } of this._animCommands) pe(e, t);
		for (let { type: e, handler: t } of this._animActionTypes) he(e, t);
	},
	unregister(e) {
		let t = this._plugins.findIndex((t) => t.name === e);
		t < 0 || ((this._teardowns.get(e) ?? []).forEach((e) => e()), this._teardowns.delete(e), this._plugins.splice(t, 1));
	}
};
function ye(e) {
	return e;
}
var be = T([]);
function U(e) {
	be.value.length >= 10 && be.value.shift(), be.value.push(e);
}
function xe() {
	be.value = [];
}
//#endregion
//#region src/composables/useSteps.ts
function Se(e, t) {
	if (!e.trim()) return 0;
	let n = e.split("|").map((e) => e.trim()), r = 0;
	for (let e of n) {
		let n = e.match(/^@(\w+)\((.+)\)$/);
		if (n) {
			let e = fe(n[1]);
			e ? r += e.countSteps(n[2], t) : r += 1;
		} else r += 1;
	}
	return r;
}
function Ce(e) {
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
var we = /* @__PURE__ */ RegExp("<(sp-anim|sp-jump|sp-pause|sp-meanwhile|sp-toc|sp-include|sp-svg|sp-slide-source)(\\s[^>]*)?/>", "gi"), Te = /* @__PURE__ */ RegExp("<(sp-drag|sp-slide)(\\s[^>]*)?(/?)>", "gi");
function Ee(e) {
	return e.replace(we, "<$1$2></$1>");
}
function De(e) {
	let t = 0;
	return e.replace(Te, (e, n, r, i) => {
		let a = `<${n} :editable-index="${t}"${i || ""}${r || ""}>`;
		return (r ?? "").includes(":editable-index=") ? e : (t++, a);
	});
}
function Oe(e) {
	return e.replace(/(\p{Emoji_Presentation})/gu, (e) => `<span style="display: inline-flex; vertical-align: middle; line-height: 0;"><svg viewBox="0 0 100 100" style="width:1em; height:1em; display: inline-block;"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${e}</text></svg></span>`);
}
function ke(e) {
	e.querySelectorAll("sp-pause").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "+1"), e.replaceWith(t);
	}), e.querySelectorAll("sp-meanwhile").forEach((e) => {
		let t = document.createElement("sp-jump");
		t.setAttribute("at", "0"), e.replaceWith(t);
	});
}
function Ae(e) {
	let t = 0, n = (e) => {
		let r = Array.from(e.children);
		for (let e of r) e.tagName.toLowerCase() === "sp-step" && (e.getAttribute("also") === null ? t = parseInt(e.getAttribute("from") || "0", 10) : (e.setAttribute("from", String(t)), e.removeAttribute("also"))), n(e);
	};
	n(e);
}
function W(e) {
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
function je(e) {
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
					let { relative: e, value: i } = Ce(n.getAttribute("at"));
					e ? t += i : t = i, o.push(n), r(t);
					continue;
				}
				if (a === "sp-anim") {
					let i = [null, "false"].includes(n.getAttribute("no-jump")), a = n.getAttribute("at") ?? "+0", o = t, { relative: s, value: c } = Ce(a);
					s ? o += c : o = c - 1, n.setAttribute("at", String(o));
					try {
						o += Se(n.getAttribute("spec") || "", e);
					} catch (e) {
						console.error("(Caught) Error counting anim spec parts:", e), U(`Error counting anim spec parts for <sp-anim> at step ${t}: ${e}`);
					}
					i ? (t = o, r(t)) : r(o);
				}
				if (a === "sp-alternatives") {
					let { relative: e, value: i } = Ce(n.getAttribute("at") ?? "+0");
					e ? t += i : t = i, t += n.childElementCount, r(t - 1), s = !0, c = !0;
				}
				if (a === "sp-steps" || !s && n.hasAttribute("sp-steps")) {
					let e = n.getAttribute("at") ?? "+1", i = [null, "false"].includes(n.getAttribute("no-jump")), o = parseInt(n.getAttribute("every") || "1", 10), l = n.getAttribute("animation") || "", u = t, d = Ce(e);
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
function Me(e) {
	for (let t of ve._domTransforms) t(e);
}
function G(e) {
	let t = document.createElement("div");
	t.innerHTML = e, ke(t), Ae(t), W(t);
	let n = je(t);
	return Me(t), {
		html: t.innerHTML,
		steps: n
	};
}
function K() {
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
		processSlideHtml: G
	};
}
function Ne(e) {
	return e == null ? null : G(e.html);
}
//#endregion
//#region src/composables/includeCache.ts
var Pe = /* @__PURE__ */ new Map(), Fe = /* @__PURE__ */ new Map(), Ie = /* @__PURE__ */ new Map(), Le = /* @__PURE__ */ new Map(), Re = [];
function ze(e) {
	Re = e.map((e) => new RegExp(e));
}
function Be(e) {
	return Re.some((t) => t.test(e));
}
var q = /* @__PURE__ */ new Map();
function Ve(e, t) {
	q.set(e, {
		size: t ? t.length : 0,
		timestamp: Date.now()
	});
}
function He(e) {
	let t = Pe.get(e);
	return t || (t = T(void 0), Pe.set(e, t)), t;
}
function Ue(e) {
	let t = Fe.get(e);
	return t || (t = T(void 0), Fe.set(e, t)), t;
}
function We(e) {
	if (Be(e)) return Promise.resolve();
	let t = He(e);
	if (t.value !== void 0) return Promise.resolve();
	if (Ie.has(e)) return Ie.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.text();
	}).then((n) => {
		t.value = n, Ve(e, n), Ie.delete(e);
	}).catch(() => {
		t.value = "", Ve(e), Ie.delete(e);
	});
	return Ie.set(e, n), n;
}
function Ge(e) {
	if (Be(e)) return Promise.resolve();
	let t = Ue(e);
	if (t.value !== void 0) return Promise.resolve();
	if (Le.has(e)) return Le.get(e);
	let n = fetch(e).then((e) => {
		if (!e.ok) throw Error(`HTTP ${e.status}`);
		return e.blob();
	}).then((e) => new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => t(r.result), r.onerror = n, r.readAsDataURL(e);
	})).then((n) => {
		t.value = n, Ve(e, n), Le.delete(e);
	}).catch(() => {
		t.value = "", Ve(e), Le.delete(e);
	});
	return Le.set(e, n), n;
}
function Ke() {
	let e = {};
	for (let [t, n] of Pe) n.value !== void 0 && (e[t] = n.value);
	let t = {};
	for (let [e, n] of Fe) n.value !== void 0 && (t[e] = n.value);
	return JSON.stringify({
		text: e,
		binary: t
	});
}
function qe(e) {
	let t = JSON.parse(e), n = Date.now();
	if (t.text) for (let [e, r] of Object.entries(t.text)) He(e).value = r, q.set(e, {
		size: r.length,
		timestamp: n
	});
	else for (let [e, r] of Object.entries(t)) He(e).value = r, q.set(e, {
		size: r.length,
		timestamp: n
	});
	if (t.binary) for (let [e, r] of Object.entries(t.binary)) Ue(e).value = r, q.set(e, {
		size: r.length,
		timestamp: n
	});
}
function Je() {
	let e = [];
	for (let [t] of Pe) {
		let n = q.get(t);
		e.push({
			path: t,
			size: n?.size ?? 0,
			timestamp: n?.timestamp ?? 0,
			type: "text"
		});
	}
	for (let [t] of Fe) {
		let n = q.get(t);
		e.push({
			path: t,
			size: n?.size ?? 0,
			timestamp: n?.timestamp ?? 0,
			type: "binary"
		});
	}
	return e.sort((e, t) => t.timestamp - e.timestamp);
}
function Ye() {
	for (let e of Pe.values()) e.value = void 0;
	for (let [e] of Pe) q.delete(e);
	Ie.clear();
}
function Xe(e) {
	let t = window.location.href, n = new URL(e, t).href;
	for (let [e, r] of Pe) try {
		if (new URL(e, t).href === n) {
			r.value = void 0, q.delete(e), Ie.delete(e);
			return;
		}
	} catch {}
}
function Ze() {
	for (let e of Pe.values()) e.value = void 0;
	for (let e of Fe.values()) e.value = void 0;
	Pe.clear(), Fe.clear(), q.clear(), Ie.clear(), Le.clear();
}
function Qe(e) {
	let t = Pe.get(e);
	t && (t.value = void 0);
	let n = Fe.get(e);
	n && (n.value = void 0), q.delete(e);
}
//#endregion
//#region src/composables/resolveIncludes.ts
async function $e(e) {
	let t = He(e);
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
function et(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function tt(e, t = /* @__PURE__ */ new Set(), n = window.location.pathname) {
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
			let n = await $e(e);
			return n = Ee(n), n = De(n), {
				src: e,
				content: await tt(n, t, e)
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
		let n = RegExp(`<sp-include[^>]*?src="${et(e)}"[^>]*?(\\/?>|><\\/sp-include>)`, "g");
		l = l.replace(n, t);
	}
	return l;
}
function nt(e) {
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
var rt = [
	"Shift",
	"Meta",
	"Alt",
	"Control"
], it = 1e3, J = "keydown", at = typeof navigator == "object" ? navigator.platform : "", ot = /Mac|iPod|iPhone|iPad/.test(at) ? "Meta" : "Control", st = at === "Win32" ? ["Control", "Alt"] : ["Alt"];
function ct(e) {
	return !!(e.key && e.code && e.getModifierState);
}
function lt(e) {
	let t = e.target;
	return e.repeat || e.isComposing || t !== e.currentTarget && t.matches("[contenteditable],input,select,textarea");
}
function Y(e, t) {
	return typeof e.getModifierState == "function" ? e.getModifierState(t) || st.includes(t) && e.getModifierState("AltGraph") : !1;
}
function ut(e) {
	return e.trim().split(" ").map((e) => {
		let t = e.split(/(?<=\w|\])\+/), n = t.pop(), r = n.match(/^\((.+)\)$/), i = r ? RegExp(`^(?:${r[1]})$`, "iv") : n, a = [], o = [];
		for (let e of t) {
			let t = e.match(/^\[(.*)\]$/), n = t?.[1] ?? e;
			n = n === "$mod" ? ot : n, t ? o.push(n) : a.push(n);
		}
		return [
			a,
			o,
			i
		];
	});
}
function dt(e, [t, n, r]) {
	let i = t.includes("AltGraph");
	return !((r instanceof RegExp ? !(r.test(e.key) || r.test(e.code)) : r.toUpperCase() !== e.key.toUpperCase() && r !== e.code) || t.find((t) => !Y(e, t)) || rt.find((a) => !t.includes(a) && !n.includes(a) && r !== a && Y(e, a) && !(i && st.includes(a))));
}
function ft(e, t = {}) {
	let n = t.timeout ?? it, r = t.ignore ?? lt, i = Object.keys(e).map((t) => [
		t,
		ut(t),
		e[t]
	]), a = /* @__PURE__ */ new Map(), o = null;
	return (e) => {
		if (!ct(e) || r(e)) return;
		let t = [];
		for (let [n, r, o] of i) {
			let [i, ...s] = a.get(n) || r;
			if (!dt(e, i)) Y(e, e.key) || a.delete(n);
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
function pt(e, t, n = {}) {
	let r = n.event ?? J, i = ft(t, n);
	return e.addEventListener(r, i, n.capture), () => {
		e.removeEventListener(r, i, n.capture);
	};
}
//#endregion
//#region src/keymap/manager.ts
var mt = class {
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
		this._unsubscribe = pt(window, t, { ignore: (e) => lt(e) || this._getContext().dragging });
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
function ht(e) {
	let t = new mt(e.getContext);
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
function gt(e, t) {
	let n = (t) => e(t);
	return t && (n.__bind = t), n;
}
//#endregion
//#region src/keymap/defaults.ts
function _t(e) {
	return (t) => {
		t.ArrowRight = t.Space = () => e.next(), t.ArrowLeft = () => e.prev(), t.ArrowUp = () => e.goToPrevBegin(), t.ArrowDown = () => e.goToNextBegin(), t.a = () => e.goToPrevEnd(), t.z = () => e.goToNextEnd(), t.Home = () => e.goTo(0), t.End = () => e.goTo(e.total.value - 1), t.f = gt(() => {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}, { preventDefault: !1 }), t.Escape = gt(() => {
			document.fullscreenElement && document.exitFullscreen().catch(() => {}), e.onOverviewExit?.(), e.onBlackoutExit?.();
		}, { preventDefault: !1 }), t.p = () => e.onPresenterToggle?.(), t.o = () => e.onOverviewToggle?.(), t.g = () => e.onGoPrompt?.(), t.b = () => e.onBlackoutToggle?.(), t.d = () => e.onDevPaneToggle?.(), t.c = () => e.onChunkBarToggle?.();
	};
}
//#endregion
//#region src/composables/useNavigation.ts
function vt(e, t) {
	let n = [_t(e), ...t?.extraSetups ?? []], { rebuild: r } = ht({
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
function yt() {
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
function bt(e = 1920, t = 1080) {
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
var xt = "sp-config", St = {
	navLocked: !1,
	overviewScale: .15,
	proMode: !1,
	logSteps: !1,
	darkMode: "light"
};
function Ct() {
	try {
		let e = localStorage.getItem(xt);
		return e ? {
			...St,
			...JSON.parse(e)
		} : { ...St };
	} catch {
		return { ...St };
	}
}
var wt = w(Ct());
N(wt, () => {
	try {
		localStorage.setItem(xt, JSON.stringify(wt));
	} catch {}
}, { deep: !0 });
function Tt() {
	return wt;
}
function Et() {
	for (let e of Object.keys(wt)) e in St ? wt[e] = St[e] : delete wt[e];
}
//#endregion
//#region src/composables/useSlideRefinement.ts
function Dt(e) {
	function t() {
		let t = e.root();
		t && ve.refineAllSlides(t);
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
//#region src/composables/useChunklets.ts
function Ot(e) {
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
function kt(e) {
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
function At(e, t) {
	return e.replace(/\$(\w+)/g, (e, n) => n in t ? String(t[n]) : `$${n}`);
}
function jt(e) {
	if (e.params.length === 0) return "instant";
	let t = e.params.includes("w"), n = e.params.includes("h");
	return t || n ? "drag" : "click";
}
function Mt() {
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
//#region src/composables/dragEditing.ts
var X = T("idle"), Nt = "sp-drag-saved-flash", Z = null, Pt = null;
function Ft() {
	Z && clearTimeout(Z), Pt && clearTimeout(Pt), X.value = "saving", Pt = setTimeout(() => It(), 4e3);
}
function It(e = !1) {
	Pt && clearTimeout(Pt), X.value = "saved";
	let t = (() => {
		if (!e) return !1;
		try {
			return sessionStorage.setItem(Nt, "1"), !0;
		} catch {
			return !1;
		}
	})();
	Z && clearTimeout(Z), Z = setTimeout(() => {
		if (X.value = "idle", t) try {
			sessionStorage.removeItem(Nt);
		} catch {}
	}, 2200);
}
function Lt() {
	Pt && clearTimeout(Pt), Z && clearTimeout(Z), X.value = "error", Z && clearTimeout(Z), Z = setTimeout(() => {
		X.value = "idle";
	}, 4e3);
}
function Rt() {
	try {
		let e = sessionStorage.getItem(Nt);
		return sessionStorage.removeItem(Nt), e === "1" ? (X.value = "saved", Z && clearTimeout(Z), Z = setTimeout(() => {
			X.value = "idle";
		}, 2200), !0) : !1;
	} catch {
		return !1;
	}
}
var zt = /* @__PURE__ */ new Map(), Q = null, Bt = !1, Vt = !1, Ht = "sp-drag-edit-target";
function Ut(e) {
	try {
		sessionStorage.setItem(Ht, JSON.stringify({
			index: e.index,
			slide: e.slide
		}));
	} catch {}
}
function Wt() {
	try {
		sessionStorage.removeItem(Ht);
	} catch {}
}
var Gt = 0;
function Kt() {
	Gt++;
}
function qt() {
	setTimeout(() => {
		Gt = Math.max(0, Gt - 1);
	}, 0);
}
function Jt(e) {
	return e.el.isConnected && !!e.el.closest(".sp-slide-current") && !e.el.closest(".sp-overview");
}
function Yt(e) {
	let t = parseInt(window.getComputedStyle(e.el).zIndex, 10);
	return isNaN(t) ? 0 : t;
}
function Xt(e, t) {
	let n = [];
	for (let r of zt.values()) Jt(r) && Zt(r.el, e, t) && n.push(r);
	return n.sort((e, t) => {
		let n = Yt(e), r = Yt(t);
		return n === r ? e.el.compareDocumentPosition(t.el) & Node.DOCUMENT_POSITION_PRECEDING ? -1 : 1 : r - n;
	});
}
function Zt(e, t, n) {
	let r = e.getBoundingClientRect();
	if (t < r.left || t > r.right || n < r.top || n > r.bottom) return !1;
	let i = 0, a = window.getComputedStyle(e).transform;
	if (a && a !== "none") {
		let e = a.match(/matrix\(([^)]+)\)/) || a.match(/matrix3d\(([^)]+)\)/);
		if (e) {
			let t = e[1].split(",").map((e) => parseFloat(e.trim()));
			i = Math.atan2(t[1], t[0]);
		}
	}
	let o = Mt(), s = t - (r.left + r.width / 2), c = n - (r.top + r.height / 2), l = Math.cos(i), u = Math.sin(i), d = s * l + c * u, f = -s * u + c * l, p = .5;
	return Math.abs(d) <= o * e.offsetWidth / 2 + p && Math.abs(f) <= o * e.offsetHeight / 2 + p;
}
var Qt = [], $ = !1;
function $t() {
	$ = !0;
}
function en(e) {
	let t = Xt(e.clientX, e.clientY);
	if (t.length === 0) {
		Qt = [], $ = !1;
		return;
	}
	let n = Q && Jt(Q) ? Q : null;
	if (!$ && n && t.includes(n)) {
		let e = Qt.indexOf(n);
		if (e !== -1) {
			$ = !1, sn(Qt[(e + 1) % Qt.length]);
			return;
		}
	}
	$ = !1, Qt = t.slice(), sn(t[0]);
}
function tn(e) {
	if (!Q || Gt > 0) return;
	let t = e.target;
	if (t instanceof Element && !t.closest(".sp-edit-quit-btn") && !Q.el.contains(t)) {
		for (let e of zt.values()) if (e.el.contains(t)) return;
		Wt(), Q.saveAndEnd();
	}
}
function nn(e) {
	zt.set(e.el, e), Bt ||= (document.addEventListener("dblclick", en, !0), !0), Vt ||= (document.addEventListener("click", tn), !0);
}
function rn(e) {
	zt.delete(e), Q && Q.el === e && (Q = null, V.dragging = !1, an());
}
function an() {
	document.body.classList.toggle("sp-editing-drag", V.dragging);
}
function on() {
	return Q !== null;
}
function sn(e) {
	if (!Jt(e)) return;
	let t = Q;
	t !== e && (Q = e, V.dragging = !0, Ut(e), an(), t && t.saveAndEnd(), e.begin());
}
function cn(e) {
	Q === e && (Q = null, V.dragging = !1, an());
}
function ln() {
	Q && (Wt(), Q.saveAndEnd());
}
function un() {
	Wt();
}
function dn(e) {
	if (Q) return !1;
	let t = null;
	try {
		let e = sessionStorage.getItem(Ht);
		if (!e) return !1;
		t = JSON.parse(e);
	} catch {
		return !1;
	}
	return !t || typeof t.index != "number" || t.index < 0 || t.index !== e.index || t.slide !== e.slide ? !1 : (sn(e), !0);
}
//#endregion
//#region src/composables/optimisticEdits.ts
var fn = /* @__PURE__ */ new Map(), pn = T(""), mn = null;
function hn(e) {
	mn = e;
}
function gn(e, t) {
	fn.set(e, t), mn?.();
}
function _n(e) {
	return fn.get(e) ?? null;
}
function vn(e) {
	return e.replace(/^rbox="|"$/g, "");
}
function yn(e) {
	let t = fn.get(e);
	if (!t) return null;
	let n = vn(t).split("|");
	return n.length < 5 ? null : {
		x: parseFloat(n[0]) || 0,
		y: parseFloat(n[1]) || 0,
		w: n[2],
		h: n[3],
		rotate: parseFloat(n[4]) || 0
	};
}
var bn = /<(sp-drag|sp-slide)(\s[^>]*)?(\/?)>/gi;
function xn(e, t) {
	let n = 0, r;
	for (bn.lastIndex = 0; (r = bn.exec(e)) !== null;) {
		if (n === t) {
			if (r[1] !== "sp-drag") return null;
			let t = r.index, n = e.indexOf("</sp-drag>", t);
			return n === -1 ? null : {
				start: t,
				end: n,
				slice: e.slice(t, n)
			};
		}
		n++;
	}
	return null;
}
function Sn(e, t) {
	let n = xn(e, t);
	if (!n) return null;
	let r = n.slice.match(/(?:^|\s)rbox="([^"]*)"/);
	return r ? r[1] : "";
}
function Cn(e, t, n) {
	let r = xn(e, t);
	if (!r) return e;
	let i = vn(n), a;
	if (/ rbox=/.test(r.slice)) {
		let t = /(<sp-drag\s[^>]*?\brbox=)"[^"]*"/i.exec(r.slice);
		if (!t) return e;
		a = r.slice.replace(t[0], `${t[1]}"${i}"`);
	} else {
		let t = /<sp-drag\b([^>]*?)(\/?\s*>)/i, n = t.exec(r.slice);
		if (!n) return e;
		a = r.slice.replace(t, `<sp-drag${n[1]} rbox="${i}"${n[2]}`);
	}
	return a === r.slice ? e : e.slice(0, r.start) + a + e.slice(r.end);
}
function wn(e) {
	let t = e;
	for (let [e, n] of fn) {
		let r = Cn(t, e, n);
		r !== t && (t = r);
	}
	return t;
}
function Tn(e) {
	for (let t of Array.from(fn.keys())) {
		let n = fn.get(t);
		n != null && vn(Sn(e, t) ?? "") === vn(n) && fn.delete(t);
	}
	return wn(e);
}
function En() {
	return oe(wn(pn.value));
}
//#endregion
//#region src/components/SpStepManager.vue
var Dn = /* @__PURE__ */ f({
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
}), On = /* @__PURE__ */ f({
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
				"sp-step-manager": Dn,
				...t.components
			};
			a.value = f({
				template: `<div${r}>${e}<sp-step-manager /></div>`,
				components: i
			});
		}, { immediate: !0 }), (e, t) => (S(), o("div", { class: g(r.value) }, [(S(), i(O(a.value)))], 2));
	}
}), kn = { class: "sp-dev-pane" }, An = { class: "sp-dev-header" }, jn = { class: "sp-dev-section" }, Mn = {
	key: 0,
	class: "sp-dev-empty"
}, Nn = {
	key: 1,
	class: "sp-dev-table"
}, Pn = ["title"], Fn = { class: "sp-dev-num" }, In = { class: "sp-dev-num" }, Ln = ["onClick"], Rn = ["disabled"], zn = { class: "sp-dev-section" }, Bn = ["title"], Vn = { class: "sp-dev-section sp-dev-config" }, Hn = { class: "sp-dev-config-fields" }, Un = { class: "sp-dev-config-label" }, Wn = {
	key: 0,
	class: "sp-dev-choice-group"
}, Gn = ["onClick"], Kn = ["checked", "onChange"], qn = [
	"min",
	"max",
	"step",
	"value",
	"onInput"
], Jn = ["value", "onInput"], Yn = /* @__PURE__ */ f({
	__name: "SpDevPane",
	props: {
		visible: { type: Boolean },
		exportFn: { type: Function }
	},
	emits: ["close"],
	setup(r, { emit: c }) {
		let u = Tt(), d = n(() => {
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
		let w = r, D = T(Je()), O = null;
		function k() {
			M(), O = setInterval(() => {
				D.value = Je();
			}, 1e3);
		}
		function M() {
			O !== null && (clearInterval(O), O = null);
		}
		N(() => w.visible, (e) => {
			e ? (D.value = Je(), k()) : M();
		}), y(() => {
			w.visible && k();
		}), b(M);
		function ee() {
			Ze(), D.value = Je();
		}
		function te(e) {
			Qe(e), D.value = Je();
		}
		function ne() {
			w.exportFn?.();
		}
		function re() {
			Et();
		}
		function P(e) {
			return e < 1024 ? e + " B" : e < 1024 * 1024 ? (e / 1024).toFixed(1) + " KB" : (e / (1024 * 1024)).toFixed(1) + " MB";
		}
		function I(e) {
			if (!e) return "—";
			let t = new Date(e);
			return t.toLocaleTimeString() + " " + t.toLocaleDateString();
		}
		return (n, c) => (S(), i(t, { to: "body" }, [r.visible ? (S(), o("div", {
			key: 0,
			class: "sp-dev-overlay",
			onClick: c[1] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", kn, [
			s("div", An, [s("h2", { onClick: C }, [c[2] ||= l(" Dev Tools ", -1), _.value > 0 ? (S(), o("span", {
				key: 0,
				class: g(["sp-dev-title-clicks", x.value])
			}, A(_.value) + "/9", 3)) : a("", !0)]), s("button", {
				class: "sp-dev-close",
				onClick: c[0] ||= (e) => n.$emit("close"),
				"aria-label": "Close"
			}, "×")]),
			s("section", jn, [
				s("h3", null, "Live Updates (" + A(j(h)) + ")", 1),
				s("h3", null, "Cache (" + A(D.value.length) + " entries)", 1),
				D.value.length === 0 ? (S(), o("div", Mn, "No cached entries")) : (S(), o("table", Nn, [c[3] ||= s("thead", null, [s("tr", null, [
					s("th", null, "Path"),
					s("th", null, "Size"),
					s("th", null, "Fetched"),
					s("th", null, "Type"),
					s("th")
				])], -1), s("tbody", null, [(S(!0), o(e, null, E(D.value, (e) => (S(), o("tr", { key: e.path + e.type }, [
					s("td", {
						class: "sp-dev-path",
						title: e.path
					}, A(e.path), 9, Pn),
					s("td", Fn, A(P(e.size)), 1),
					s("td", In, A(I(e.timestamp)), 1),
					s("td", null, A(e.type), 1),
					s("td", null, [s("button", {
						class: "sp-dev-del",
						onClick: (t) => te(e.path),
						title: "Remove entry"
					}, "×", 8, Ln)])
				]))), 128))])])),
				s("button", {
					class: "sp-dev-btn",
					onClick: ee,
					disabled: D.value.length === 0
				}, " Clear Cache ", 8, Rn)
			]),
			s("section", zn, [
				c[4] ||= s("h3", null, "Actions", -1),
				s("button", {
					class: "sp-dev-btn",
					onClick: ne
				}, "Export Standalone"),
				s("button", {
					class: "sp-dev-btn",
					onClick: re,
					title: d.value
				}, "Clear localStorage Keys", 8, Bn)
			]),
			s("details", Vn, [c[5] ||= s("summary", null, [s("h3", null, "Config")], -1), s("div", Hn, [(S(!0), o(e, null, E(m.value, (t) => (S(), o("label", {
				key: t.key,
				class: "sp-dev-config-field"
			}, [s("span", Un, A(t.key), 1), t.type === "choice" ? (S(), o("span", Wn, [(S(!0), o(e, null, E(t.choices, (e) => (S(), o("button", {
				key: e,
				class: g(["sp-dev-choice-btn", { active: j(u)[t.key] === e }]),
				onClick: (n) => j(u)[t.key] = e
			}, A(e), 11, Gn))), 128))])) : t.type === "boolean" ? (S(), o("input", {
				key: 1,
				type: "checkbox",
				checked: !!j(u)[t.key],
				onChange: (e) => j(u)[t.key] = e.target.checked
			}, null, 40, Kn)) : t.type === "number" ? (S(), o("input", {
				key: 2,
				type: "range",
				min: t.min ?? 0,
				max: t.max ?? 1,
				step: t.step ?? .01,
				value: j(u)[t.key],
				onInput: (e) => j(u)[t.key] = parseFloat(e.target.value)
			}, null, 40, qn)) : (S(), o("input", {
				key: 3,
				type: "text",
				value: j(u)[t.key],
				onInput: (e) => j(u)[t.key] = e.target.value
			}, null, 40, Jn))]))), 128))])]),
			c[6] ||= s("footer", { class: "sp-dev-footer" }, [s("small", null, "toolbar ◆ to open")], -1)
		])])) : a("", !0)]));
	}
});
//#endregion
//#region src/composables/useElementScale.ts
function Xn(e, t, r) {
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
var Zn = { class: "sp-presenter-main" }, Qn = { class: "sp-presenter-sidebar" }, $n = { class: "sp-presenter-info" }, er = { class: "sp-presenter-num" }, tr = { class: "sp-presenter-progress" }, nr = ["title"], rr = { class: "sp-presenter-clock-time" }, ir = {
	key: 0,
	class: "sp-presenter-clock-feedback"
}, ar = { class: "sp-presenter-notes" }, or = ["innerHTML"], sr = "sp-presentation-clock", cr = "sp-presentation-log", lr = /* @__PURE__ */ f({
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
		let t = e, r = p("stepIndex"), c = T(null), u = T(null), { transformStyle: d } = Xn(c, t.designWidth, t.designHeight), { transformStyle: f } = Xn(u, t.designWidth, t.designHeight), m = T(280), h = !1;
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
		}), ee = n(() => t.currentIndex >= t.total - 1 ? null : t.slides[t.currentIndex + 1] ?? null), te = n(() => Ne(ee.value)), ne = n(() => te.value?.html ?? ""), re = n(() => te.value?.steps ?? 0);
		function P() {
			try {
				let e = localStorage.getItem(sr);
				return e ? JSON.parse(e) : Date.now();
			} catch {
				return Date.now();
			}
		}
		function F() {
			try {
				localStorage.setItem(sr, JSON.stringify(z.value));
			} catch {}
		}
		function I() {
			try {
				let e = localStorage.getItem(cr);
				return e ? JSON.parse(e) : [];
			} catch {
				return [];
			}
		}
		function L() {
			try {
				localStorage.setItem(cr, JSON.stringify(R.value));
			} catch {}
		}
		let R = T(I()), z = T(P()), B = T(Date.now()), ie = null, ae = n(() => {
			let e = Math.floor((B.value - z.value) / 1e3), t = Math.floor(e / 60), n = e % 60;
			return `${String(t).padStart(2, "0")}:${String(n).padStart(2, "0")}`;
		}), oe = n(() => {
			let e = R.value.length;
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
		function ce() {
			confirm("Reset timer and clear slide log?") && (z.value = Date.now(), B.value = Date.now(), R.value = [], F(), L(), de("Reset"));
		}
		function le() {
			let e = new Date(z.value).toLocaleString(), t = ["slide,elapsed_sec,heading"];
			t.push(`0,0,"Started: ${e}"`);
			for (let e of R.value) {
				let n = e.heading ? `"${e.heading.replace(/"/g, "\"\"")}"` : "", r = e.step === void 0 ? String(e.slide) : `${e.slide}.${String(e.step).padStart(2, "0")}`;
				t.push(`${r},${e.elapsed},${n}`);
			}
			let n = t.join("\n");
			navigator.clipboard.writeText(n).catch(() => {});
			let r = new Blob([n], { type: "text/csv;charset=utf-8;" }), i = URL.createObjectURL(r), a = document.createElement("a");
			a.href = i, a.download = `slides-log-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`, a.click(), URL.revokeObjectURL(i), de("Copied + Downloaded");
		}
		let H = T(""), ue = null;
		function de(e) {
			H.value = e, ue && clearTimeout(ue), ue = setTimeout(() => {
				H.value = "";
			}, 1500);
		}
		return N(() => [r.value, t.currentIndex], ([e, n], [r, i]) => {
			e === r ? t.config.logSteps && n !== i && V(e, n) : se(e);
		}), y(() => {
			z.value = P(), F(), B.value = Date.now(), ie = setInterval(() => {
				B.value = Date.now();
			}, 1e3), se(t.currentIndex);
		}), b(() => {
			ie && clearInterval(ie), x(), k();
		}), (t, n) => (S(), o("div", {
			class: "sp-presenter-layout",
			style: v(C.value)
		}, [
			s("div", Zn, [
				s("div", {
					class: "sp-presenter-preview",
					ref_key: "previewContainerEl",
					ref: c
				}, [s("div", {
					style: v(j(d)),
					class: "sp-slide-scaler"
				}, [e.current ? (S(), i(On, {
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
				}, [ee.value ? (S(), i(On, {
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
			s("div", Qn, [s("div", $n, [
				s("div", er, [l(A(e.currentIndex + 1) + " ", 1), s("small", null, "/ " + A(e.total), 1)]),
				s("div", tr, [s("div", {
					class: "sp-presenter-progress-bar",
					style: v({ width: e.progressPercent + "%" })
				}, null, 4)]),
				s("div", {
					class: "sp-presenter-clock",
					title: oe.value
				}, [
					s("span", rr, A(ae.value), 1),
					H.value ? (S(), o("span", ir, A(H.value), 1)) : a("", !0),
					s("span", { class: "sp-presenter-clock-actions" }, [s("button", {
						class: "sp-presenter-clock-btn",
						title: "Export log (CSV)",
						onClick: le
					}, "⬇"), s("button", {
						class: "sp-presenter-clock-btn",
						title: "Reset timer",
						onClick: ce
					}, "↺")])
				], 8, nr),
				e.blackout ? (S(), o("div", {
					key: 0,
					class: "sp-presenter-blackout-badge",
					onClick: n[0] ||= (...t) => e.exitBlackout && e.exitBlackout(...t)
				}, "BLACKED OUT")) : a("", !0)
			]), s("div", ar, [n[2] ||= s("h3", null, "Speaker Notes", -1), s("div", {
				class: "sp-presenter-notes-content",
				innerHTML: M.value
			}, null, 8, or)])])
		], 4));
	}
}), ur = { class: "sp-overview-thumb-num" }, dr = /* @__PURE__ */ f({
	__name: "SpPrintView",
	props: {
		steps: { type: Boolean },
		components: {},
		designWidth: {},
		designHeight: {},
		config: {},
		slides: {},
		currentIndex: { default: 0 },
		stepIndex: { default: 0 }
	},
	setup(t) {
		let r = t, a = n(() => r.slides.map((e) => Ne(e))), l = n(() => ({
			width: `${r.designWidth}px`,
			height: `${r.designHeight}px`
		})), d = n(() => `
@page {
  size: ${r.designWidth}px ${r.designHeight}px;
}
`), f = n(() => a.value.map((e) => Math.max(1, Math.floor(e.steps)))), p = n(() => {
			let e = [], t = 0;
			for (let n of f.value) e.push(t), t += n;
			return e;
		}), m = n(() => {
			if (r.slides.length === 0) return 0;
			let e = Math.min(Math.max(r.currentIndex, 0), r.slides.length - 1);
			if (!r.steps) return e;
			let t = Math.min(Math.max(r.stepIndex, 0), f.value[e] - 1);
			return p.value[e] + t;
		}), g = n(() => r.steps ? r.slides.flatMap((e, t) => {
			let n = f.value[t];
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
		}))), _ = T(null), b = T(!1);
		function x(e) {
			_.value?.querySelectorAll(".sp-print-wrapper").item(e)?.scrollIntoView({ block: "start" });
		}
		return N(m, (e, t) => {
			!b.value || e === t || h(() => x(e));
		}), y(() => {
			b.value = !0;
		}), (n, r) => (S(), o("div", {
			class: "sp-print",
			ref_key: "printRootEl",
			ref: _
		}, [
			r[0] ||= c("<div class=\"sp-print-helper-container\"><div class=\"sp-print-helper\"><p>To export as PDF:</p><ul><li><kbd>Ctrl</kbd> + <kbd>P</kbd> (open the print dialog)</li><li>Select &quot;Save as/to PDF&quot; (or similar)</li><li>Select &quot;Margins&quot; as &quot;None&quot;</li><li><input type=\"checkbox\" checked disabled> Check &quot;Print backgrounds&quot; </li><li><input type=\"checkbox\" disabled> Uncheck &quot;Print headers and footers&quot; </li><li>Click &quot;Save&quot;</li></ul><p><label>Dismiss this dialog! (reload to get back)<input type=\"checkbox\"></label></p></div></div>", 1),
			(S(!0), o(e, null, E(g.value, ({ slide: e, slideI: n, html: r, step: i }, a) => (S(), o("div", {
				key: a,
				class: "sp-print-wrapper",
				style: v(l.value)
			}, [u(On, {
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
			]), s("div", ur, A(n + 1), 1)], 4))), 128)),
			(S(), i(O("style"), { innerHTML: d.value }, null, 8, ["innerHTML"]))
		], 512));
	}
}), fr = { class: "sp-overview-grid" }, pr = ["onClick"], mr = { class: "sp-overview-thumb-stage" }, hr = { class: "sp-overview-thumb-num" }, gr = /* @__PURE__ */ f({
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
		let r = t, i = n(() => r.slides.map((e) => Ne(e)));
		return (n, r) => (S(), o("div", {
			class: "sp-overview",
			onClick: r[0] ||= F((e) => n.$emit("close"), ["self"])
		}, [s("div", fr, [(S(!0), o(e, null, E(t.slides, (e, r) => (S(), o("div", {
			key: r,
			class: g(["sp-overview-thumb", {
				active: r === t.currentIndex,
				"sp-overview-h1": t.slideHeadingLevels[r] === 1,
				"sp-overview-h2": t.slideHeadingLevels[r] === 2,
				"sp-overview-h3": t.slideHeadingLevels[r] === 3
			}]),
			style: v(t.overviewThumbStyle),
			onClick: (e) => n.$emit("select", r)
		}, [s("div", mr, [s("div", { style: v(t.overviewSlideStyle) }, [u(On, {
			slide: e,
			html: i.value[r].html,
			fixedStep: i.value[r].steps - 1,
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"fixedStep",
			"components"
		])], 4)]), s("div", hr, A(r + 1), 1)], 14, pr))), 128))])]));
	}
}), _r = { class: "sp-go-prompt-box" }, vr = ["onKeydown"], yr = {
	key: 0,
	class: "sp-go-results"
}, br = ["onClick", "onMouseenter"], xr = { class: "sp-go-result-thumb" }, Sr = { class: "sp-go-result-text" }, Cr = { class: "sp-go-result-num" }, wr = ["innerHTML"], Tr = {
	key: 1,
	class: "sp-go-no-results"
}, Er = /* @__PURE__ */ f({
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
		let i = t, c = r, l = n(() => i.slides.map((e) => Ne(e))), d = T(""), f = T(0), p = T(null), m = n(() => i.slides.map((e, t) => {
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
		}, [s("div", _r, [re(s("input", {
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
		}, null, 40, vr), [[ee, d.value]]), _.value.length ? (S(), o("div", yr, [(S(!0), o(e, null, E(_.value, (n, r) => (S(), o("div", {
			key: n.index,
			class: g(["sp-go-result", { focused: r === f.value }]),
			onClick: (e) => k(n.index),
			onMouseenter: (e) => f.value = r
		}, [s("div", xr, [s("div", { style: v(b.value) }, [u(On, {
			slide: t.slides[n.index],
			html: l.value[n.index].html,
			components: t.components
		}, null, 8, [
			"slide",
			"html",
			"components"
		])], 4)]), s("div", Sr, [s("div", Cr, "Slide " + A(n.index + 1), 1), (S(!0), o(e, null, E(n.matches, (e, t) => (S(), o("div", {
			key: t,
			class: "sp-go-result-heading",
			innerHTML: x(e)
		}, null, 8, wr))), 128))])], 42, br))), 128))])) : d.value && !/^\d*$/.test(d.value) ? (S(), o("div", Tr, " No slides match \"" + A(d.value) + "\" ", 1)) : a("", !0)])]));
	}
});
//#endregion
//#region src/export.ts
async function Dr() {
	let e = document.getElementById("sp-content");
	if (!e) throw Error("Export failed: #sp-content not found");
	let t = e.textContent?.trim() || "";
	t = Ee(t);
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
		le.has(e) || e.hasAttribute("data-vite-dev-id") || r.push(e.textContent ?? "");
	});
	let a = `<template id="sp-cache">${Ke().replace(/</g, "&lt;")}</template>`, o = document.getElementById("sp-init")?.outerHTML ?? "", s = {};
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
var Or = null, kr = null;
async function Ar() {
	if (!Or) return kr || (kr = (async () => {
		try {
			let { createHighlighter: e } = await import("shiki");
			Or = await e({
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
			Or = null;
		}
	})(), kr);
}
function jr(e) {
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
async function Mr(e) {
	if (await Ar(), !Or) return e;
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.querySelectorAll("pre");
	for (let e of n) {
		let t = e.querySelector("code");
		if (!t) continue;
		let n = jr(t);
		if (!n) continue;
		let r = t.textContent || "";
		try {
			e.outerHTML = Or.codeToHtml(r, {
				lang: n,
				theme: "dark-plus"
			});
		} catch {}
	}
	return t.innerHTML;
}
//#endregion
//#region src/components/SpPresentation.vue?vue&type=script&setup=true&lang.ts
var Nr = ["data-source-file-push"], Pr = { class: "sp-global-error" }, Fr = {
	key: 0,
	class: "sp-loading"
}, Ir = { class: "sp-global-top" }, Lr = { class: "sp-global-bottom" }, Rr = { class: "sp-slide-footer" }, zr = { class: "sp-chunklet-hint" }, Br = {
	key: 0,
	class: "sp-save-spinner",
	"aria-hidden": "true"
}, Vr = { class: "sp-nav-bar" }, Hr = ["title"], Ur = ["disabled"], Wr = ["disabled"], Gr = {
	key: 0,
	class: "sp-nav-more-menu"
}, Kr = { class: "sp-nav-more-icon" }, qr = { class: "sp-nav-more-item sp-nav-more-browse" }, Jr = { class: "sp-nav-pills" }, Yr = {
	key: 0,
	class: "sp-nav-pill-ellipsis"
}, Xr = ["onClick", "aria-label"], Zr = {
	key: 1,
	class: "sp-chunklets-bar"
}, Qr = ["onClick"], $r = { class: "sp-chunklets-bar-badge" }, ei = { class: "sp-progress" }, ti = /* @__PURE__ */ f({
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
		let c = t, d = n(() => c.print === "slides" ? "print-slides" : c.print === "steps" ? "print-steps" : c.presenter ? "presenter" : "main"), { slides: p, currentIndex: m, current: _, total: w, goTo: M, nextSlide: ee, prevSlide: P, setSlides: I } = se(c.slides), { stepIndex: L, totalSteps: R, isFirstStep: z, isLastStep: B, nextStep: ie, prevStep: ce } = K(), le = !1, H = null, ue = T(0), de = k(null), fe = k(null);
		N(() => c.raw?.before, (e) => {
			if (!e) {
				de.value = null;
				return;
			}
			de.value = f({
				template: `<div style="display:contents" class="sp-raw-before">${e}</div>`,
				components: c.components
			});
		}, { immediate: !0 }), N(() => c.raw?.after, (e) => {
			if (!e) {
				fe.value = null;
				return;
			}
			fe.value = f({
				template: `<div style="display:contents" class="sp-raw-after">${e}</div>`,
				components: c.components
			});
		}, { immediate: !0 });
		let { openPresenterWindow: pe, closePresenter: me, presenterActive: he, syncState: ge, syncBlackout: _e, send: ye, onMessage: U, channel: Se } = yt(), { transformStyle: Ce, containerStyle: we } = bt(c.designWidth, c.designHeight), Te = T(null), ke = T(null), Ae = T(null);
		Dt({
			currentIndex: m,
			stepIndex: L,
			contentVersion: ue,
			root: () => Ae.value
		}), C("stepIndex", L), C("slideIndex", m), C("contentVersion", ue), C("slides", p), C("goTo", M), C("sp-components", c.components);
		let W = T(c.rawSlideSources ?? p.value.map((e) => e.html));
		C("rawSlideSources", W), hn(() => {
			pn.value && (W.value = En());
		});
		let je = T(1), Me = T(!1), Pe = n(() => window.location.pathname);
		N(m, (e, t) => {
			e !== t && (je.value = e > t ? 1 : -1, Me.value = !0, un());
		});
		let Fe = n(() => {
			let e = _.value?.transition ?? c.transition;
			return e === "" ? "none" : e;
		}), Ie = n(() => {
			let e = `sp-${Fe.value}`;
			return Fe.value === "none" ? e : `${e} sp-dir-${je.value === 1 ? "forward" : "backward"}`;
		}), Le = n(() => Fe.value === "none" ? 0 : _.value?.transitionDuration ?? c.transitionDuration), Re = n(() => ({
			"--sp-design-width": `${c.designWidth}px`,
			"--sp-design-height": `${c.designHeight}px`,
			"--sp-transition-duration": `${Le.value}ms`
		}));
		x(() => {
			Fe.value === "none" || !Me.value || !ke.value || (Me.value = !1, ke.value.classList.add("sp-swapping"), ke.value.offsetHeight, ke.value.classList.remove("sp-swapping"));
		});
		let ze = n(() => m.value === 0), Be = n(() => m.value === w.value - 1), q = n(() => w.value === 0 ? 0 : (m.value + 1) / w.value * 100), Ve = n(() => {
			let e = We.value;
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
		}), He = n(() => {
			let e = p.value.map((e, t) => e.fakeEnd ? t : -1).filter((e) => e >= 0), t = w.value - 1;
			return t >= 0 && !e.includes(t) && e.push(t), e.sort((e, t) => e - t);
		}), Ue = n(() => He.value.find((e) => e >= m.value) ?? w.value - 1), We = n(() => Ue.value + 1), Ge = n(() => Ne(_.value)), Ke = n(() => Ge.value?.html ?? "");
		function qe() {
			B.value ? m.value < w.value - 1 && ee() : ie();
		}
		function Je() {
			z.value ? m.value > 0 && P() : ce();
		}
		let Ye = n(() => m.value === 0 ? null : p.value[m.value - 1] ?? null), Xe = n(() => Ne(Ye.value)), Ze = n(() => Xe?.value?.html ?? ""), Qe = n(() => Xe?.value?.steps ?? 0), $e = n(() => m.value >= w.value - 1 ? null : p.value[m.value + 1] ?? null), et = n(() => Ne($e.value)), tt = n(() => et?.value?.html ?? "");
		n(() => et?.value?.steps ?? "");
		function rt() {
			document.fullscreenElement ? document.exitFullscreen().catch(() => {}) : document.documentElement.requestFullscreen().catch(() => {});
		}
		function it() {
			he.value ? me() : pe();
		}
		let J = Tt();
		V.config = J;
		function at() {
			try {
				let e = sessionStorage.getItem("sp-live-overview");
				return sessionStorage.removeItem("sp-live-overview"), e === "1";
			} catch {
				return !1;
			}
		}
		let ot = T(at());
		N(ot, (e) => {
			V.overview = e;
		}, { immediate: !0 }), Rt();
		let st = T(!1), ct = T(!1), lt = T(!0), Y = T(!1), ut = T(null);
		function dt(e) {
			let t = document.documentElement;
			e === "auto" ? t.removeAttribute("data-dark-mode") : t.dataset.darkMode = e;
		}
		function ft() {
			J.darkMode = J.darkMode === "dark" ? "light" : "dark";
		}
		let pt = n(() => J.darkMode === "dark" ? "Dark" : "Light"), mt = n(() => J.darkMode === "dark" ? "●" : "○");
		N(() => J.darkMode, dt, { immediate: !0 }), ne(() => {
			V.navLocked = J.navLocked, V.currentIndex = m.value, V.stepIndex = L.value, V.total = w.value, V.effectiveLast = Ue.value, V.effectiveTotal = We.value, V.fakeEndIndices = He.value;
		}), V.toggleNavLock = () => {
			J.navLocked = !J.navLocked;
		}, V.goTo = M, V.next = qe, V.prev = Je, V.nextSlide = ee, V.prevSlide = P, V.export = Dr;
		let ht = n(() => ({
			width: c.designWidth * J.overviewScale + "px",
			height: c.designHeight * J.overviewScale + "px"
		})), gt = n(() => ({
			transform: `scale(${J.overviewScale})`,
			transformOrigin: "top left",
			width: c.designWidth + "px",
			height: c.designHeight + "px"
		})), _t = n(() => p.value.map((e) => {
			let t = document.createElement("div");
			t.innerHTML = e.html;
			let n = t.querySelector("h1,h2,h3");
			return n ? parseInt(n.tagName[1]) : 0;
		}));
		function xt(e) {
			ot.value = !1, H = 0, M(e);
		}
		let St = T(!1);
		function Ct() {
			St.value = !0;
		}
		function wt() {
			St.value = !1;
		}
		function Et(e) {
			wt(), M(e);
		}
		N(_, (e, t) => {
			R.value = G(e.html).steps, t?.num !== e?.num && (H === null ? le ? (L.value = Math.min(Math.max(L.value, 0), Math.max(0, R.value - 1)), le = !1) : je.value === -1 ? L.value = Math.max(0, R.value - 1) : L.value = 0 : (L.value = Math.min(Math.max(H, 0), Math.max(0, R.value - 1)), H = null));
		});
		let Ot = T(!1);
		N([m, L], () => {
			Ot.value || ge(m.value, L.value);
		}, { flush: "post" }), N([m, L], () => {
			c.presenter || kt();
		}, { flush: "post" });
		function kt() {
			let e = `#${m.value}/${L.value}`;
			history.replaceState(null, "", e);
		}
		function Nt() {
			let e = location.hash.match(/^#(\d+)(?:\/(\d+))?$/);
			if (!e) return;
			let t = parseInt(e[1], 10), n = e[2] === void 0 ? 0 : parseInt(e[2], 10);
			t >= 0 && t < w.value && (t !== m.value && (le = !0), M(t), L.value = n);
		}
		function Z() {
			Nt();
		}
		U("sync", (e) => {
			Ot.value = !0, e.slide !== m.value && (le = !0), M(e.slide), L.value = e.step, h(() => {
				Ot.value = !1;
			});
		}), U("presenter-ready", () => {
			ge(m.value, L.value);
		}), U("presenter-close", () => {
			me();
		}), U("blackout", (e) => {
			ct.value = e.active;
		}), c.presenter && (ye("presenter-ready"), window.addEventListener("beforeunload", () => {
			ye("presenter-close");
		}));
		function Pt() {
			ct.value = !ct.value, _e(ct.value);
		}
		function Ft() {
			ct.value && (ct.value = !1, _e(!1));
		}
		let It = [...ve._keymapSetups];
		ve.applyAnimRegistrations();
		let { rebuildKeymap: Lt } = vt({
			next: qe,
			prev: Je,
			goTo: M,
			goToPrevBegin: Bt,
			goToNextBegin: Ht,
			goToPrevEnd: Vt,
			goToNextEnd: Ut,
			currentIndex: m,
			current: _,
			total: w,
			nextStep: ie,
			prevStep: ce,
			stepIndex: L,
			totalSteps: R,
			isLastStep: B,
			isFirstStep: z,
			onPresenterToggle: it,
			onOverviewToggle: () => ot.value = !ot.value,
			onOverviewExit: () => {
				ot.value = !1;
			},
			onGoPrompt: Ct,
			onBlackoutToggle: Pt,
			onBlackoutExit: Ft,
			onDevPaneToggle: () => {
				J.proMode ? Wt() : ft();
			},
			onChunkBarToggle: Xt
		}, {
			getContext: () => ({
				overview: ot.value,
				presenter: he.value,
				blackout: ct.value,
				devPane: st.value,
				dragging: V.dragging,
				goPrompt: St.value
			}),
			extraSetups: It
		});
		y(() => {
			_.value && (R.value = G(_.value.html).steps), c.presenter ? lt.value = !1 : (Nt(), h(() => {
				kt(), lt.value = !1;
			}), window.addEventListener("hashchange", Z)), document.addEventListener("click", Gt, !0), zt(c.seed), Q();
		});
		function zt(e) {
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
		async function Q() {
			for (let e = 0; e < p.value.length; e++) {
				let t = p.value[e], n = await Mr(t.html);
				n !== t.html && (p.value[e] = {
					...t,
					html: n
				});
			}
		}
		b(() => {
			document.removeEventListener("click", Gt, !0), window.removeEventListener("hashchange", Z), window.removeEventListener("keydown", cn);
		});
		function Bt() {
			L.value > 0 ? L.value = 0 : m.value > 0 && (H = 0, M(m.value - 1));
		}
		function Vt() {
			m.value > 0 && M(m.value - 1);
		}
		function Ht() {
			m.value < w.value - 1 && (H = 0, M(m.value + 1));
		}
		function Ut() {
			L.value < R.value - 1 ? L.value = G(p.value[m.value].html).steps - 1 : m.value < w.value - 1 && (H = Math.max(0, G(p.value[m.value + 1].html).steps - 1), M(m.value + 1));
		}
		function Wt() {
			st.value = !st.value;
		}
		function Gt(e) {
			Y.value && ut.value && !ut.value.contains(e.target) && (Y.value = !1);
		}
		let Kt = n(() => {
			let e = V.selectedChunklet;
			return e ? jt(e) : "click";
		});
		function qt(e) {
			let t = e.currentTarget;
			if (!t) return {
				x: 0,
				y: 0
			};
			let n = t.getBoundingClientRect(), r = Mt();
			return {
				x: Math.round((e.clientX - n.left) / r),
				y: Math.round((e.clientY - n.top) / r)
			};
		}
		function Jt(e, t) {
			if (!e) return;
			let n = m.value, r = p.value[n];
			if (e.kind === "typst") {
				let i = At(e.html, t), a = `<div class="sp-chunklet-placeholder">chunklet: ${e.name}</div>`;
				p.value = p.value.map((e, t) => t === n ? {
					...e,
					html: e.html + "\n" + a
				} : e), W.value[n] && (W.value = W.value.map((e, t) => t === n ? e + "\n" + a : e)), R.value = G(_.value.html).steps, ue.value++, V.chunkletMode = !1, V.selectedChunklet = null, Zt(i, r.editableIndex, e, {
					file: r.sourceFile,
					sourceLine: r.sourceLine
				});
				return;
			}
			let i = At(e.html, t), a = r.html;
			p.value = p.value.map((e, t) => t === n ? {
				...e,
				html: a + "\n" + i
			} : e), W.value[n] && (W.value = W.value.map((e, t) => t === n ? e + "\n" + i : e)), R.value = G(_.value.html).steps, ue.value++, V.chunkletMode = !1, V.selectedChunklet = null, Zt(i, r.editableIndex);
		}
		function Yt(e) {
			if (V.selectedChunklet === e && V.chunkletMode) {
				an();
				return;
			}
			V.selectedChunklet = e, V.chunkletMode = !0;
		}
		function Xt() {
			V.showChunkletsBar = !V.showChunkletsBar;
		}
		function Zt(e, t, n, r) {
			let i = ke.value?.querySelector(".sp-slide-current");
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
			let a = ke.value?.querySelector(".sp-slide-current [data-source-file-push] + *") ?? i, o = i ? nt(a) : null;
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
		let Qt = T({
			x: 0,
			y: 0
		}), $ = T({
			x: 0,
			y: 0
		}), $t = T(!1), en = n(() => {
			let e = Math.min(Qt.value.x, $.value.x), t = Math.min(Qt.value.y, $.value.y), n = Math.abs($.value.x - Qt.value.x), r = Math.abs($.value.y - Qt.value.y);
			return {
				left: e + "px",
				top: t + "px",
				width: n + "px",
				height: r + "px"
			};
		});
		function tn(e) {
			e.preventDefault(), Qt.value = qt(e), $.value = { ...Qt.value }, $t.value = !0;
		}
		function nn(e) {
			$t.value && ($.value = qt(e));
		}
		function rn(e) {
			if (!$t.value) return;
			$t.value = !1;
			let t = V.selectedChunklet;
			if (!t) return;
			let n = jt(t), r = Qt.value, i = $.value, a = Math.abs(i.x - r.x), o = Math.abs(i.y - r.y);
			n === "drag" && !(a < 5 && o < 5) ? Jt(t, {
				x: Math.min(r.x, i.x),
				y: Math.min(r.y, i.y),
				w: Math.abs(i.x - r.x),
				h: Math.abs(i.y - r.y)
			}) : Jt(t, {
				x: r.x,
				y: r.y
			});
		}
		function an() {
			V.chunkletMode = !1, V.selectedChunklet = null, $t.value = !1;
		}
		let sn = T(null);
		N(() => V.chunkletMode, (e) => {
			e ? window.addEventListener("keydown", cn) : window.removeEventListener("keydown", cn);
		}), N(() => V.dragging, (e) => {
			if (!e && sn.value != null) {
				let e = sn.value;
				sn.value = null, dn(e);
			}
		});
		function cn(e) {
			e.key === "Escape" && an();
		}
		function dn(e) {
			if (on() || V.dragging) {
				sn.value = e;
				return;
			}
			sn.value = null, e = Tn(e), pn.value = e, W.value = oe(e);
			let t = Oe(De(Ee(e))), n = document.createElement("div");
			n.innerHTML = t;
			let r = ae(n);
			if (r.length === 0) return;
			let i = m.value, a = L.value, o = Math.min(i, r.length - 1);
			le = !0, I(r), m.value = o, R.value = G(_.value.html).steps, o === i ? (L.value = Math.min(a, R.value - 1), le = !1) : L.value = 0, Q().then(() => {
				ue.value++;
			});
		}
		return r({ updateSlides: dn }), (n, r) => (S(), o("div", {
			ref_key: "rootEl",
			ref: Ae,
			class: g(["sp-presentation", { "sp-presenter-mode": t.presenter }]),
			style: v(Re.value)
		}, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": Pe.value
			}, null, 8, Nr),
			c.raw?.before ? (S(), i(O(de.value), { key: 0 })) : a("", !0),
			j(be).length > 0 ? (S(), o("div", {
				key: 1,
				class: "sp-global-error-overlay",
				onClick: r[0] ||= F((e) => j(xe)(), ["self"])
			}, [s("div", Pr, [r[15] ||= s("h3", null, "Global Errors", -1), s("ul", null, [(S(!0), o(e, null, E(j(be), (e, t) => (S(), o("li", { key: t }, A(e), 1))), 128))])])])) : a("", !0),
			d.value == "main" ? (S(), o(e, { key: 2 }, [
				lt.value ? (S(), o("div", Fr, [...r[16] ||= [s("div", { class: "sp-loading-text" }, "Loading…", -1)]])) : a("", !0),
				re(s("div", {
					class: "sp-viewport",
					style: v(j(we)),
					ref_key: "viewportEl",
					ref: Te
				}, [s("div", {
					class: "sp-scale-wrap",
					style: v(j(Ce))
				}, [
					s("div", Ir, [D(n.$slots, "global-top")]),
					s("div", {
						class: g(Ie.value),
						ref_key: "transitionWrapEl",
						ref: ke
					}, [
						Ye.value ? (S(), i(On, {
							class: "sp-slide-prev",
							key: j(m) - 1,
							slide: Ye.value,
							html: Ze.value,
							fixedStep: Qe.value - 1,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"fixedStep",
							"components"
						])) : a("", !0),
						j(_) ? (S(), i(On, {
							class: "sp-slide-current",
							key: j(m),
							slide: j(_),
							html: Ke.value,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0),
						$e.value ? (S(), i(On, {
							class: "sp-slide-next",
							key: j(m) + 1,
							slide: $e.value,
							html: tt.value,
							fixedStep: 0,
							components: c.components
						}, null, 8, [
							"slide",
							"html",
							"components"
						])) : a("", !0)
					], 2),
					s("div", Lr, [D(n.$slots, "global-bottom", {}, () => [s("footer", Rr, [s("span", null, A(j(V).config.speaker), 1), s("span", null, A(j(m) + 1) + " / " + A(We.value), 1)])])]),
					j(V).chunkletMode ? (S(), o("div", {
						key: 0,
						class: g(["sp-chunklet-overlay", { "sp-chunklet-drag": Kt.value === "drag" }]),
						onPointerdown: tn,
						onPointermove: nn,
						onPointerup: rn
					}, [s("div", zr, [l(A(Kt.value === "drag" ? "Click + drag to draw " + j(V).selectedChunklet?.name : Kt.value === "click" ? "Click to place " + j(V).selectedChunklet?.name : "Click to insert " + j(V).selectedChunklet?.name) + " ", 1), r[17] ||= s("span", { class: "sp-chunklet-hint-esc" }, "ESC to cancel", -1)]), $t.value ? (S(), o("div", {
						key: 0,
						class: "sp-chunklet-preview",
						style: v(en.value)
					}, null, 4)) : a("", !0)], 34)) : a("", !0),
					j(V).dragging ? (S(), o("button", {
						key: 1,
						class: "sp-edit-quit-btn",
						title: "Quit edit mode (save and exit)",
						onClick: r[1] ||= F((e) => j(ln)(), ["stop"])
					}, " quit edit mode ")) : a("", !0),
					j(V).dragging && j(X) !== "idle" ? (S(), o("div", {
						key: 2,
						class: g(["sp-save-chip", "sp-save-" + j(X)]),
						role: "status"
					}, [j(X) === "saving" ? (S(), o("span", Br)) : a("", !0), j(X) === "saving" ? (S(), o(e, { key: 1 }, [l("saving…")], 64)) : j(X) === "saved" ? (S(), o(e, { key: 2 }, [l("saved")], 64)) : j(X) === "error" ? (S(), o(e, { key: 3 }, [l("save failed")], 64)) : a("", !0)], 2)) : a("", !0)
				], 4)], 4), [[te, !lt.value]]),
				s("nav", { class: g(["sp-nav", { locked: j(J).navLocked }]) }, [s("div", Vr, [
					s("button", {
						class: g(["sp-nav-btn sp-nav-lock", { locked: j(J).navLocked }]),
						title: j(J).navLocked ? "Unlock nav" : "Lock nav visible",
						onClick: r[2] ||= (e) => j(J).navLocked = !j(J).navLocked
					}, [...r[18] ||= [s("svg", {
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
					})], -1)]], 10, Hr),
					s("button", {
						class: "sp-nav-btn",
						disabled: ze.value && j(z),
						"aria-label": "Previous",
						onClick: Je
					}, [...r[19] ||= [s("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 20 20",
						fill: "none"
					}, [s("path", {
						d: "M12 4l-6 6 6 6",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round"
					})], -1)]], 8, Ur),
					s("span", {
						class: "sp-nav-counter",
						onClick: Ct
					}, A(j(m) + 1) + " / " + A(We.value), 1),
					s("button", {
						class: "sp-nav-btn",
						disabled: Be.value && j(B),
						"aria-label": "Next",
						onClick: qe
					}, [...r[20] ||= [s("svg", {
						width: "20",
						height: "20",
						viewBox: "0 0 20 20",
						fill: "none"
					}, [s("path", {
						d: "M8 4l6 6-6 6",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round"
					})], -1)]], 8, Wr),
					s("button", {
						class: "sp-nav-btn sp-fullscreen-btn",
						"aria-label": "Toggle fullscreen",
						title: "Fullscreen (F)",
						onClick: rt
					}, [...r[21] ||= [s("svg", {
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
						class: g(["sp-nav-btn", { active: j(he) }]),
						"aria-label": "Toggle presenter",
						title: "Presenter (P)",
						onClick: it
					}, [...r[22] ||= [s("svg", {
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
						ref: ut
					}, [s("button", {
						class: g(["sp-nav-btn sp-nav-more-btn", { active: Y.value }]),
						"aria-label": "More options",
						title: "More…",
						onClick: r[3] ||= (e) => Y.value = !Y.value
					}, "⋯", 2), Y.value ? (S(), o("div", Gr, [
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[4] ||= (e) => {
								ft(), Y.value = !1;
							}
						}, [s("span", Kr, A(mt.value), 1), l(" " + A(pt.value), 1)]),
						r[30] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[5] ||= (e) => {
								Wt(), Y.value = !1;
							}
						}, [...r[23] ||= [s("span", { class: "sp-nav-more-icon" }, "◇", -1), l(" Dev tools ", -1)]]),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[6] ||= (e) => {
								ot.value = !ot.value, Y.value = !1;
							}
						}, [...r[24] ||= [s("span", { class: "sp-nav-more-icon" }, "⊞", -1), l(" Overview ", -1)]]),
						s("button", {
							class: g(["sp-nav-more-item", { active: j(V).showChunkletsBar }]),
							onClick: r[7] ||= (e) => {
								Xt(), Y.value = !1;
							}
						}, [...r[25] ||= [s("span", { class: "sp-nav-more-icon" }, "▤", -1), l(" Chunks ", -1)]], 2),
						r[31] ||= s("div", { class: "sp-nav-more-divider" }, null, -1),
						s("button", {
							class: "sp-nav-more-item",
							onClick: r[8] ||= (e) => Pt()
						}, [s("span", { class: g(["sp-nav-more-icon sp-nav-more-icon-blackout", { active: ct.value }]) }, "●", 2), r[26] ||= l(" Blackout ", -1)]),
						s("div", qr, [
							s("button", {
								class: "sp-nav-more-browse-btn",
								title: "End of previous slide (A)",
								onClick: r[9] ||= (e) => Vt()
							}, [...r[27] ||= [s("svg", {
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
							r[29] ||= l(" | ", -1),
							s("button", {
								class: "sp-nav-more-browse-btn",
								title: "End of next slide (Z)",
								onClick: r[10] ||= (e) => Ut()
							}, [...r[28] ||= [s("svg", {
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
				]), s("div", Jr, [(S(!0), o(e, null, E(Ve.value, (t) => (S(), o(e, { key: t.type === "pill" ? "p" + t.index : t.id }, [t.type === "ellipsis" ? (S(), o("span", Yr, "…")) : (S(), o("button", {
					key: 1,
					class: g(["sp-nav-pill", {
						active: t.index === j(m),
						"sp-nav-pill-h1": _t.value[t.index] === 1,
						"sp-nav-pill-h2": _t.value[t.index] === 2,
						"sp-nav-pill-h3": _t.value[t.index] === 3
					}]),
					onClick: (e) => {
						j(M)(t.index), L.value = 0;
					},
					"aria-label": "Go to slide " + (t.index + 1)
				}, null, 10, Xr))], 64))), 128))])], 2),
				j(V).showChunkletsBar && j(V).chunkletDefs.length ? (S(), o("div", Zr, [(S(!0), o(e, null, E(j(V).chunkletDefs, (e) => (S(), o("button", {
					key: e.name,
					class: g(["sp-chunklets-bar-btn", { active: j(V).selectedChunklet === e }]),
					onClick: (t) => Yt(e)
				}, [l(A(e.name) + " ", 1), s("span", $r, A(j(jt)(e)), 1)], 10, Qr))), 128)), s("button", {
					class: "sp-chunklets-bar-btn",
					onClick: r[11] ||= (e) => j(V).showChunkletsBar = !j(V).showChunkletsBar
				}, "×")])) : a("", !0),
				s("div", ei, [s("div", {
					class: "sp-progress-bar",
					style: v({ width: q.value + "%" })
				}, null, 4)]),
				ct.value ? (S(), o("div", {
					key: 2,
					class: "sp-main-blackout",
					onClick: r[12] ||= (e) => ct.value = !1
				}, [...r[32] ||= [s("span", { class: "sp-main-blackout-hint" }, "click to dismiss", -1)]])) : a("", !0)
			], 64)) : d.value == "presenter" ? (S(), i(lr, {
				key: 3,
				current: j(_),
				currentIndex: j(m),
				total: j(w),
				activeHtml: Ke.value,
				progressPercent: q.value,
				blackout: ct.value,
				exitBlackout: Ft,
				components: c.components,
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				config: j(J),
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
			])) : d.value == "print-slides" || d.value == "print-steps" ? (S(), i(dr, {
				key: 4,
				steps: d.value == "print-steps",
				components: c.components,
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				config: j(J),
				slides: j(p),
				currentIndex: j(m),
				stepIndex: j(L)
			}, null, 8, [
				"steps",
				"components",
				"designWidth",
				"designHeight",
				"config",
				"slides",
				"currentIndex",
				"stepIndex"
			])) : a("", !0),
			ot.value ? (S(), i(gr, {
				key: 5,
				slides: j(p),
				currentIndex: j(m),
				slideHeadingLevels: _t.value,
				overviewThumbStyle: ht.value,
				overviewSlideStyle: gt.value,
				components: c.components,
				onClose: r[13] ||= (e) => ot.value = !1,
				onSelect: xt
			}, null, 8, [
				"slides",
				"currentIndex",
				"slideHeadingLevels",
				"overviewThumbStyle",
				"overviewSlideStyle",
				"components"
			])) : a("", !0),
			u(Yn, {
				visible: st.value,
				"export-fn": j(V).export,
				onClose: r[14] ||= (e) => st.value = !1
			}, null, 8, ["visible", "export-fn"]),
			St.value ? (S(), i(Er, {
				key: 6,
				slides: j(p),
				designWidth: c.designWidth,
				designHeight: c.designHeight,
				components: c.components,
				total: j(w),
				onClose: wt,
				onSelect: Et
			}, null, 8, [
				"slides",
				"designWidth",
				"designHeight",
				"components",
				"total"
			])) : a("", !0),
			c.raw?.after ? (S(), i(O(fe.value), { key: 7 })) : a("", !0)
		], 6));
	}
}), ni = /* @__PURE__ */ f({
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
}), ri = /* @__PURE__ */ f({
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
				let e = fe(n[1]);
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
					let t = fe(r[1]);
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
						console.error("(Caught) Error applying anim action:", t), U(`Error applying anim action at step ${e}: ${t}`);
					}
				}, n.delayedBy);
				else try {
					r.apply(i, n);
				} catch (t) {
					console.error("(Caught) Error applying anim action:", t), U(`Error applying anim action at step ${e}: ${t}`);
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
				console.error("(Caught) Error initializing anim action:", e), U(`Error initializing anim action: ${e}`);
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
}), ii = ["data-debug"], ai = {
	key: 0,
	class: "sp-drag-edit-overlay"
}, oi = ["onMousedown", "onTouchstart"], si = .25, ci = /*@__PURE__*/ f({
	__name: "SpDrag",
	props: {
		rbox: { default: "" },
		x: { default: 0 },
		y: { default: 0 },
		w: { default: "auto" },
		h: { default: "auto" },
		rotate: { default: 0 },
		editableIndex: { default: -1 }
	},
	setup(t) {
		let r = p("slideIndex", T(0)), i = t, c = n(() => {
			if (!i.rbox) return null;
			let e = i.rbox.split("|");
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
		function O() {
			let e = l.value?.closest("#sp-presentation"), t = e ? getComputedStyle(e) : null, n = parseFloat(t?.getPropertyValue("--sp-design-width") ?? ""), r = parseFloat(t?.getPropertyValue("--sp-design-height") ?? "");
			return {
				width: Number.isFinite(n) ? n : 1920,
				height: Number.isFinite(r) ? r : 1080
			};
		}
		function k() {
			let { width: e, height: t } = O();
			return {
				x: e * si,
				y: t * si,
				w: e * (1 - 2 * si),
				h: t * (1 - 2 * si),
				rotate: 0
			};
		}
		function A(e) {
			let t = yn(i.editableIndex);
			if (t) return t[e];
			let n = c.value;
			return n ? n[e] : i.rbox ? i[e] : k()[e];
		}
		function j() {
			f.value = C(A("x")), m.value = C(A("y")), h.value = A("w"), _.value = A("h"), x.value = C(A("rotate")), M = P(!0);
		}
		let M = "";
		function ee(e) {
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
		function te() {
			P(!0) !== M && j(), l.value && (h.value === "auto" && (h.value = l.value.offsetWidth || 200), _.value === "auto" && (_.value = l.value.offsetHeight || 100)), u.value = !0, window.addEventListener("keydown", ee);
		}
		function N() {
			u.value = !1, window.removeEventListener("keydown", ee), K.value && cn(K.value);
		}
		function ne(e = !1) {
			let t = P(), n = P(!0);
			if (n === t) {
				e || N();
				return;
			}
			Ft();
			let a = !!i.rbox || _n(i.editableIndex) != null, o = l.value?.getAttribute("data-drag-id"), s = l.value?.getAttribute("data-source-line"), c = l.value?.getAttribute("data-source-file") || nt(l.value);
			fetch("/__sp_edit", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					oldAttrs: a ? n : "__sp_insert__",
					newAttrs: t,
					file: c,
					sourceLine: s ? parseInt(s, 10) : null,
					editableIndex: i.editableIndex,
					slide: r.value,
					dragId: o
				})
			}).then(async (e) => {
				let n = {};
				try {
					n = await e.json();
				} catch {}
				!e.ok || !n.ok ? (console.error("SP edit failed:", e.status, n), Lt(), I(t)) : gn(i.editableIndex, t.replace(/^rbox="|"$/g, ""));
			}).catch((e) => {
				console.error("SP edit error:", e), Lt(), I(t);
			}).finally(() => {
				e || N();
			});
		}
		function re() {
			V.devServer && P(!0) !== P() && ne(!0);
		}
		function P(e = !1) {
			return `rbox="${e ? A("x") : Math.round(f.value)}|${e ? A("y") : Math.round(m.value)}|${e ? A("w") : typeof h.value == "number" ? R(h.value) : h.value}|${e ? A("h") : typeof _.value == "number" ? R(_.value) : _.value}|${e ? A("rotate") : Math.round(x.value * 10) / 10}"`;
		}
		function I(e) {
			navigator.clipboard?.writeText(e).catch(() => {}), alert(`Could not auto-save to source.\n\nCopy this attribute and replace the existing sp-drag rbox attribute manually:\n\n${e}`);
		}
		let L = (e) => typeof e == "number" || /^\d+(\.\d+)?$/.test(e) ? e + "px" : e, R = (e) => Math.round(e), z = (e) => Math.round(e / 20) * 20, B = {
			e: ["w"],
			s: ["h"],
			w: ["x", "w"],
			n: ["y", "h"],
			ne: [
				"y",
				"h",
				"w"
			],
			nw: [
				"x",
				"y",
				"w",
				"h"
			],
			se: ["w", "h"],
			sw: [
				"x",
				"w",
				"h"
			]
		}, ie = n(() => ({
			position: "absolute",
			left: L(f.value),
			top: L(m.value),
			width: L(h.value),
			height: L(_.value),
			transform: x.value ? `rotate(${x.value}deg)` : void 0
		})), ae = !1, oe = 0, se = 0, ce = 0, le = 0;
		function H(e) {
			return "touches" in e ? {
				clientX: e.touches[0].clientX,
				clientY: e.touches[0].clientY
			} : {
				clientX: e.clientX,
				clientY: e.clientY
			};
		}
		let ue = 0;
		function de(e) {
			if (e.preventDefault(), on() && !u.value && K.value && (sn(K.value), $t()), u.value) {
				me(e);
				return;
			}
			let t = Date.now();
			if (t - ue < 300) {
				K.value && sn(K.value), ue = 0;
				return;
			}
			ue = t;
		}
		function fe(e) {
			e.preventDefault(), on() && !u.value && K.value && (sn(K.value), $t()), u.value && me(e);
		}
		function pe() {
			ae && (ae = !1, document.removeEventListener("mousemove", he), document.removeEventListener("mouseup", pe), document.removeEventListener("touchmove", he), document.removeEventListener("touchend", pe), qt(), re());
		}
		function me(e) {
			G(), Kt(), ae = !0;
			let { clientX: t, clientY: n } = H(e);
			oe = t, se = n, ce = f.value, le = m.value, document.addEventListener("mousemove", he), document.addEventListener("mouseup", pe), document.addEventListener("touchmove", he, { passive: !1 }), document.addEventListener("touchend", pe);
		}
		function he(e) {
			if (!ae) return;
			e.preventDefault();
			let t = w(), { clientX: n, clientY: r } = H(e), i = (n - oe) / t, a = (r - se) / t;
			f.value = R(ce + i), m.value = R(le + a);
		}
		let ge = !1, _e = "", ve = 0, ye = 0, be = 0, U = 0, xe = 0, Se = 0;
		function Ce() {
			ge && (ge = !1, document.removeEventListener("mousemove", Te), document.removeEventListener("mouseup", Ce), document.removeEventListener("touchmove", Te), document.removeEventListener("touchend", Ce), qt(), re());
		}
		function we(e, t) {
			if (!u.value) return;
			G(), Kt(), ge = !0;
			let { clientX: n, clientY: r } = H(e);
			_e = t, ve = n, ye = r, be = f.value, U = m.value, xe = C(h.value), Se = C(_.value), document.addEventListener("mousemove", Te), document.addEventListener("mouseup", Ce), document.addEventListener("touchmove", Te, { passive: !1 }), document.addEventListener("touchend", Ce);
		}
		function Te(e) {
			if (!ge) return;
			e.preventDefault();
			let t = w(), { clientX: n, clientY: r } = H(e), i = (n - ve) / t, a = (r - ye) / t, o = be, s = U, c = xe, l = Se;
			switch (_e) {
				case "n":
					s = U + a, l = Se - a;
					break;
				case "s":
					l = Se + a;
					break;
				case "e":
					c = xe + i;
					break;
				case "w":
					o = be + i, c = xe - i;
					break;
				case "ne":
					s = U + a, l = Se - a, c = xe + i;
					break;
				case "nw":
					o = be + i, s = U + a, c = xe - i, l = Se - a;
					break;
				case "se":
					c = xe + i, l = Se + a;
					break;
				case "sw":
					o = be + i, c = xe - i, l = Se + a;
					break;
			}
			if (c < 10 && (c = 10), l < 10 && (l = 10), e.shiftKey) for (let e of B[_e]) e === "x" ? o = z(o) : e === "y" ? s = z(s) : e === "w" ? c = z(c) : l = z(l);
			f.value = R(o), m.value = R(s), h.value = R(c), _.value = R(l);
		}
		let Ee = !1, De = 0, Oe = 0, ke = 0, Ae = 0;
		function W() {
			Ee && (Ee = !1, document.removeEventListener("mousemove", Me), document.removeEventListener("mouseup", W), document.removeEventListener("touchmove", Me), document.removeEventListener("touchend", W), qt(), re());
		}
		function je(e) {
			if (!u.value) return;
			G(), Kt(), Ee = !0;
			let t = l.value.getBoundingClientRect(), { clientX: n, clientY: r } = H(e);
			De = t.left + t.width / 2, Oe = t.top + t.height / 2, ke = Math.atan2(r - Oe, n - De), Ae = x.value, document.addEventListener("mousemove", Me), document.addEventListener("mouseup", W), document.addEventListener("touchmove", Me, { passive: !1 }), document.addEventListener("touchend", W);
		}
		function Me(e) {
			if (!Ee) return;
			e.preventDefault();
			let { clientX: t, clientY: n } = H(e), r = Math.atan2(n - Oe, t - De) - ke, i = Ae + 180 / Math.PI * r;
			e.shiftKey && (i = Math.round(i / 15) * 15), x.value = Math.round(i * 10) / 10;
		}
		function G() {
			pe(), Ce(), W();
		}
		j();
		let K = T(null);
		return y(() => {
			l.value && (K.value = {
				el: l.value,
				index: i.editableIndex,
				slide: r.value,
				begin: te,
				saveAndEnd: ne
			}, nn(K.value), !i.rbox && _n(i.editableIndex) == null && j(), dn(K.value));
		}), b(() => {
			u.value && P(!0) !== P() && ne(), K.value && rn(K.value.el);
		}), (n, r) => (S(), o("div", {
			ref_key: "el",
			ref: l,
			class: g(["sp-drag", { "sp-drag-editing": u.value }]),
			style: v(ie.value),
			onMousedown: fe,
			onTouchstart: de,
			"data-debug": t.editableIndex
		}, [s("div", { class: g(["sp-drag-content", { "sp-drag-content-blocked": u.value }]) }, [D(n.$slots, "default", {}, void 0, !0)], 2), u.value ? (S(), o("div", ai, [
			r[0] ||= s("div", { class: "sp-drag-edit-border" }, null, -1),
			(S(), o(e, null, E(d, (e) => s("div", {
				key: e,
				class: g(["sp-drag-handle", "sp-handle-" + e]),
				onMousedown: F((t) => we(t, e), ["stop"]),
				onTouchstart: F((t) => we(t, e), ["stop", "prevent"])
			}, null, 42, oi)), 64)),
			r[1] ||= s("div", { class: "sp-drag-rotate-line" }, null, -1),
			s("div", {
				class: "sp-drag-rotate-handle",
				onMousedown: F(je, ["stop"]),
				onTouchstart: F(je, ["stop", "prevent"])
			}, null, 32)
		])) : a("", !0)], 46, ii));
	}
}), li = (e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
}, ui = /*#__PURE__*/ li(ci, [["__scopeId", "data-v-89d71127"]]), di = ["src", "alt"], fi = {
	key: 1,
	class: "sp-img-loading"
}, pi = /*#__PURE__*/ li(/* @__PURE__ */ f({
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
				let t = He(e);
				if (t.value) {
					n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
					return;
				}
				try {
					if (await We(e), t.value) {
						n.value = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(t.value)}`;
						return;
					}
				} catch {}
				n.value = e;
				return;
			}
			let r = Ue(e);
			if (r.value) {
				n.value = r.value;
				return;
			}
			try {
				if (await Ge(e), r.value) {
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
		}, null, 14, di)) : (S(), o("span", fi, "…"));
	}
}), [["__scopeId", "data-v-9678aed9"]]), mi = /* @__PURE__ */ f({
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
}), hi = /* @__PURE__ */ f({
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
function gi(e) {
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
var _i = {
	key: 0,
	class: "sp-toc"
}, vi = {
	key: 0,
	class: "sp-toc-section"
}, yi = ["onClick"], bi = { class: "sp-toc-text" }, xi = /* @__PURE__ */ f({
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
		}, c = p("slides"), l = p("slideIndex"), u = p("goTo"), { tree: d } = gi(n(() => c.value)), f = n(() => l.value + i(r.highlight)), m = n(() => {
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
		return (t, n) => m.value.length ? (S(), o("nav", _i, [D(t.$slots, "default", {
			items: m.value,
			currentIndex: j(l).value,
			goTo: j(u),
			activeSection: h.value
		}, () => [r.context && h.value ? (S(), o("div", vi, A(h.value.text), 1)) : a("", !0), s("ol", null, [(S(!0), o(e, null, E(m.value, (e) => (S(), o("li", {
			key: e.slideIndex,
			class: g(["sp-toc-h" + e.level, { "sp-toc-active": e.slideIndex === f.value }]),
			onClick: (t) => j(u)(e.slideIndex)
		}, [s("span", bi, A(e.text), 1)], 10, yi))), 128))])])])) : a("", !0);
	}
}), Si = 1, Ci = {
	"": 1,
	px: 1,
	cm: 96 / 2.54,
	mm: 96 / 10 / 2.54,
	Q: 96 / 40 / 2.54,
	in: 96,
	pc: 96 / 6,
	pt: 96 / 72
};
function wi(e) {
	if (!e) return 0;
	let t = e.match(/^([\d.]+)(\w*)$/);
	return t ? parseFloat(t[1]) * (Ci[t[2]] ?? 1) : 0;
}
var Ti = (e) => {
	let t = e.querySelector("svg");
	if (!t || t.getAttribute("viewBox")) return;
	let n = wi(t.getAttribute("width")), r = wi(t.getAttribute("height"));
	n && r && (t.setAttribute("viewBox", `0 0 ${n} ${r}`), t.removeAttribute("width"), t.removeAttribute("height"));
}, Ei = (e) => {
	e.querySelectorAll("[*|href]:not([href])").forEach((e) => {
		let t = e.getAttributeNS("http://www.w3.org/1999/xlink", "href");
		t && (e.setAttribute("href", t), e.removeAttributeNS("http://www.w3.org/1999/xlink", "href"));
	});
}, Di = (e) => {
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
		let i = `svgid-${Si++}`;
		r.id = i;
		for (let { el: t, attr: r } of n[e]) {
			let n = t.getAttribute(r);
			t.setAttribute(r, n.replace("#" + e, "#" + i));
		}
	}
}, Oi = (e) => {
	e.querySelectorAll("[style]").forEach((e) => {
		let t = e.getAttribute("style");
		t && (t.split(";").forEach((t) => {
			let n = t.trim();
			if (!n || n.startsWith("-")) return;
			let [r, ...i] = n.split(":").map((e) => e.trim());
			r && i.length && e.setAttribute(r, i.join(":"));
		}), e.removeAttribute("style"));
	});
}, ki = [
	Ti,
	Ei,
	Di,
	Oi
], Ai = /*#__PURE__*/ li(/* @__PURE__ */ f({
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
			let e = [...ki];
			return t.width != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("width", String(t.width));
			}), t.height != null && e.push((e) => {
				let n = e.querySelector("svg");
				n && n.setAttribute("height", String(t.height));
			}), e;
		});
		return (t, n) => e.wrap ? (S(), o("div", m({ key: 0 }, t.$attrs, { class: "sp-svg-wrap" }), [u(zi, {
			src: e.src,
			path: e.path,
			transformers: r.value,
			"no-fix-void": "",
			"no-component": "",
			"no-wrap": ""
		}, null, 8, [
			"src",
			"path",
			"transformers"
		])], 16)) : (S(), i(zi, m({ key: 1 }, t.$attrs, {
			src: e.src,
			path: e.path,
			transformers: r.value,
			"no-fix-void": "",
			"no-component": "",
			"no-wrap": ""
		}), null, 16, [
			"src",
			"path",
			"transformers"
		]));
	}
}), [["__scopeId", "data-v-b75d770e"]]), ji = {
	key: 0,
	class: "sp-slide-source"
}, Mi = { class: "sp-slide-source-header" }, Ni = ["innerHTML"], Pi = /*#__PURE__*/ li(/* @__PURE__ */ f({
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
				let e = await Mr(a);
				i === d && (u.value = e);
			} catch {
				i === d && (u.value = a);
			}
		}, { immediate: !0 }), (e, t) => u.value ? (S(), o("div", ji, [s("div", Mi, [D(e.$slots, "header", { forSlide: c.value }, () => [l(" Slide " + A(c.value + 1) + " source ", 1)], !0)]), s("div", {
			class: "sp-slide-source-body",
			innerHTML: u.value
		}, null, 8, Ni)])) : a("", !0);
	}
}), [["__scopeId", "data-v-8a380df0"]]), Fi = ["data-source-file-push"], Ii = ["innerHTML"], Li = /*@__PURE__*/ f({
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
		},
		noWrap: {
			type: Boolean,
			default: !1
		}
	},
	setup(t) {
		let n = p("contentVersion"), r = p("sp-components", {}), a = d(() => Promise.resolve().then(() => Ri)), c = t, l = T(""), u = T(""), g = k(null), v = T(null);
		b(() => {
			v.value && clearTimeout(v.value);
		});
		function y(e) {
			c.noFixVoid || (e = Ee(e)), e = De(e);
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
				template: c.noWrap ? `${e}` : `<div class="sp-include">${e}</div>`,
				components: {
					"sp-alternatives": ni,
					"sp-anim": ri,
					"sp-drag": ui,
					"sp-img": pi,
					"sp-include": a,
					"sp-step": mi,
					"sp-style": hi,
					"sp-toc": xi,
					"sp-svg": Ai,
					"sp-slide-source": Pi,
					...r
				}
			});
		}
		function C() {
			h(() => {
				n.value++;
			});
		}
		return N(He(c.src), async (e) => {
			if (e) v.value &&= (clearTimeout(v.value), null), l.value = "", u.value = y(e), c.noComponent || x(u.value), C();
			else if (e === void 0) {
				if (v.value) return;
				v.value = setTimeout(() => {
					g.value = null, v.value = null;
				}, 500);
				try {
					await We(c.src);
				} catch (e) {
					l.value = `${e.message} (src: ${c.src})`, v.value &&= (clearTimeout(v.value), null);
				}
			}
		}, { immediate: !0 }), (n, r) => (S(), o(e, null, [
			s("span", {
				style: { display: "none" },
				"data-source-file-push": t.src
			}, null, 8, Fi),
			l.value ? (S(), o("div", m({ key: 0 }, n.$attrs, { class: "sp-include-error" }), A(l.value), 17)) : c.noComponent ? (S(), o("div", m({ key: 1 }, n.$attrs, {
				class: "sp-include",
				innerHTML: u.value
			}), null, 16, Ii)) : (S(), i(O(g.value), _(m({ key: 2 }, n.$attrs)), null, 16)),
			r[0] ||= s("span", {
				style: { display: "none" },
				"data-source-file-pop": ""
			}, null, -1)
		], 64));
	}
}), Ri = /* @__PURE__ */ L({ default: () => zi }), zi = /*#__PURE__*/ li(Li, [["__scopeId", "data-v-6d6e4e15"]]), Bi = { class: "sp-bib" }, Vi = /* @__PURE__ */ f({
	inheritAttrs: !1,
	__name: "SpBib",
	props: {
		src: {},
		path: {}
	},
	setup(e) {
		return (t, n) => (S(), o("div", Bi, [e.src ? (S(), i(zi, m({
			key: 0,
			src: e.src,
			path: e.path
		}, t.$attrs), null, 16, ["src", "path"])) : D(t.$slots, "default", {}, void 0, void 0, 1)]));
	}
}), Hi = {
	BIB_SELECTOR: ".sp-bib",
	CITE_SELECTOR: "a[role=\"doc-biblioref\"], .sp-bib-cite",
	HIDDEN_CLASS: "sp-bib-hidden",
	ABSENT_CLASS: "sp-bib-absent",
	EMPTY_CLASS: "sp-bib-empty"
}, Ui = { patch: (e) => {} };
function Wi(e = {}) {
	let t = Object.assign({}, Ui, e);
	return {
		name: "bib-compactor",
		activate(e) {
			let n = [...Yi];
			t.patch(n), document.querySelectorAll("template[data-sp-cache=\"biblio.html\"]").forEach((e) => {
				let t = Array.from(e.content.children[0].querySelectorAll("li")).map((e) => e.textContent), r = e.innerHTML;
				for (let [e, t] of n) r = typeof e == "string" ? r.replace(RegExp(e + "([ ,.])", "g"), t + "$1") : r.replace(e, t);
				e.innerHTML = r, t.forEach((t, n) => {
					e.content.children[0].querySelectorAll("li")[n].setAttribute("title", t);
				});
			});
		}
	};
}
function Gi(e = {}) {
	let t = Object.assign({}, Hi, e);
	return {
		name: "bib-filtering",
		activate(e) {
			e.addSlideRefinement({
				appliesTo: (e) => e.querySelector(t.BIB_SELECTOR) !== null,
				apply: (e) => {
					qi(t, e);
				}
			});
		}
	};
}
function Ki(e) {
	return e.closest(".sp-anim-hidden, .sp-anim-only") === null;
}
function qi(e, t) {
	let n = t.querySelectorAll(e.BIB_SELECTOR);
	if (n.length === 0) return;
	let r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set();
	t.querySelectorAll(e.CITE_SELECTOR).forEach((e) => {
		let t = e.getAttribute("href");
		if (!t?.startsWith("#")) return;
		let n = t.slice(1);
		r.add(n), Ki(e) && i.add(n);
	}), n.forEach((t) => Ji(e, t, i, r));
}
function Ji(e, t, n, r) {
	let i = 0;
	t.querySelectorAll("li").forEach((t) => {
		let a = t.getAttribute("id");
		a !== null && n.has(a) ? (t.classList.remove(e.HIDDEN_CLASS, e.ABSENT_CLASS), i++) : (t.classList.add(e.HIDDEN_CLASS), t.classList.toggle(e.ABSENT_CLASS, a === null || !r.has(a)));
	}), t.classList.toggle(e.EMPTY_CLASS, i === 0);
}
var Yi = [
	[
		"IEEE Transactions on Pattern Analysis and Machine Intelligence",
		"TPAMI",
		"venue"
	],
	[
		"Association for the Advancement of Artificial Intelligence",
		"AAAI",
		"venue"
	],
	[
		"International Joint Conference on Artificial Intelligence",
		"IJCAI",
		"venue"
	],
	[
		"Conference on Computer Vision and Pattern Recognition",
		"CVPR",
		"venue"
	],
	[
		"International Conference on Learning Representations",
		"ICLR",
		"venue"
	],
	[
		"Advances in Neural Information Processing Systems",
		"NeurIPS",
		"venue"
	],
	[
		"International Conference on Machine Learning",
		"ICML",
		"venue"
	],
	[
		"European Conference on Machine Learning",
		"ECML",
		"venue"
	],
	[
		"European Conference on Computer Vision",
		"ECCV",
		"venue"
	],
	[
		"Neural Information Processing Systems",
		"NeurIPS",
		"venue"
	],
	[
		"Journal of Machine Learning Research",
		"JMLR",
		"venue"
	],
	[
		"Artificial Intelligence",
		"AI",
		"word"
	],
	[
		"Proceedings of the",
		"Proc.",
		"word"
	],
	[
		"Transactions",
		"Trans.",
		"word"
	],
	[
		"Conference",
		"Conf.",
		"word"
	],
	[
		"International",
		"Int.",
		"word"
	],
	[
		"Applications",
		"Appl.",
		"word"
	],
	[
		"Mathematical",
		"Math.",
		"word"
	],
	[
		"Engineering",
		"Eng.",
		"word"
	],
	[
		"Letters on",
		"Lett.",
		"word"
	],
	[
		"National",
		"Nat.",
		"word"
	],
	[
		"Physical",
		"Phys.",
		"word"
	],
	[
		"Academy",
		"Acad.",
		"word"
	]
];
//#endregion
//#region src/plugins/plugins.ts
function Xi(e) {
	switch (e) {
		case "default": return [Gi(), Wi()];
		default: throw Error(`Unknown plugin set: ${e}`);
	}
}
//#endregion
//#region src/core.ts
var Zi = {
	"sp-alternatives": ni,
	"sp-anim": ri,
	"sp-drag": ui,
	"sp-img": pi,
	"sp-include": zi,
	"sp-svg": Ai,
	"sp-step": mi,
	"sp-style": hi,
	"sp-toc": xi,
	"sp-slide-source": Pi,
	"sp-bib": Vi
};
function Qi(e) {
	return typeof e == "string" ? document.querySelector(e) : e ?? null;
}
function $i(e) {
	if (e.tagName === "TEMPLATE") {
		let t = document.createElement("div");
		return t.append(e.content.cloneNode(!0)), t.innerHTML;
	}
	return e.textContent || "";
}
function ea(e) {
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
function ta(e) {
	if (!e || !e.trim()) return;
	let t = document.createElement("script");
	t.textContent = e, (document.head ?? document.documentElement).appendChild(t), t.remove();
}
function na(e) {
	if (!e || !e.trim()) return;
	let t = document.createElement("style");
	t.textContent = e, document.head.appendChild(t), le.add(t);
}
function ra(e) {
	let t = document.documentElement;
	Array.from(t.classList).filter((e) => e.startsWith("theme-")).forEach((e) => t.classList.remove(e)), t.classList.add("theme-" + e.replace(/[^a-zA-Z0-9_-]/g, ""));
}
function ia(e) {
	let t = document.documentElement;
	e.forEach((e) => e.startsWith("!") ? t.classList.remove(e.substring(1)) : t.classList.add(e));
}
function aa() {
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
async function oa(e = {}) {
	let t = document.getElementById("sp-init"), n = t ? ea($i(t)) : {};
	ta(n.js), na(n.css);
	let i = {
		...aa(),
		...n.config ?? {},
		...e
	}, { el: a, transition: o, transitionDuration: s, designWidth: c, designHeight: l, author: u, components: d, seed: f, cacheIgnore: p, plugins: m, activate: g, theme: _, variants: v, presenter: y } = i, b = i.slides;
	_ && ra(String(_)), v && ia(typeof v == "string" ? v.split(" ") : v);
	let x = [...m ?? Xi("default")];
	g && x.unshift({
		name: "__user__",
		order: 100,
		activate: g
	});
	let S = x.sort((e, t) => (e.order ?? 0) - (t.order ?? 0));
	for (let e of S) await ve.register(e);
	let C = document.getElementById("sp-content"), w = document.getElementById("sp-cache"), E = {}, D = null, O = [];
	if (C) {
		let e = await tt(C.textContent || "");
		pn.value = e, O.push(...oe(e));
		let t = Oe(De(Ee(e)));
		D = document.createElement("div"), D.innerHTML = t;
	}
	if (!b) {
		if (w?.content) {
			let e = w.content.textContent?.trim();
			e && qe(e);
		}
		D && (b = ae(D), o && b.forEach((e) => {
			e.transition === "" && (e.transition = o);
		}));
	}
	D && ie(D, E);
	let k = document.getElementById("sp-chunklets");
	if (k?.tagName === "SCRIPT") {
		let e = k.textContent || "";
		e.trim() && (V.chunkletDefs = Ot(e));
	}
	document.querySelectorAll("template[data-sp-cache]").forEach((e) => {
		let t = e.getAttribute("data-sp-cache"), n = $i(e).trim();
		t && n && (He(t).value = n);
	});
	let A = [];
	function j(e) {
		Array.from(e.children).forEach((e) => {
			if (["sp-style", "style"].includes(e.tagName.toLowerCase())) {
				let t = e.getAttribute("css") ?? e.textContent?.trim();
				if (!t) return;
				let n = document.createElement("style");
				n.textContent = t, document.head.appendChild(n), A.push(n), le.add(n);
			}
		});
	}
	function M() {
		A.forEach((e) => e.remove()), A = [];
	}
	function ee(e) {
		M();
		let t = document.createElement("div");
		t.innerHTML = e, j(t);
	}
	if (p && ze(p), D) {
		j(D);
		let e = [];
		D.querySelectorAll("sp-include").forEach((t) => {
			let n = t.getAttribute("src");
			n && e.push(We(n));
		});
		let t = /* @__PURE__ */ new Set();
		D.querySelectorAll("img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), D.querySelectorAll("sp-img[src]").forEach((e) => {
			let n = e.getAttribute("src");
			n && !n.startsWith("data:") && !n.startsWith("blob:") && t.add(n);
		}), t.forEach((t) => {
			t.match(/\.svg(\?|#|$)/i) ? e.push(We(t)) : e.push(Ge(t));
		}), await Promise.all(e);
	}
	let te = {
		...Zi,
		...d
	}, N = Qi(a) ?? document.getElementById("sp-presentation") ?? document.getElementById("app") ?? document.body, ne = new URLSearchParams(window.location.search), re = y ?? ne.has("presenter");
	Object.assign(ce, {
		transition: o,
		transitionDuration: s,
		designWidth: c,
		designHeight: l,
		author: u,
		seed: f,
		theme: _,
		raw: E,
		el: "#app"
	});
	function P(e) {
		return window.location.search.match(`[?]${e}($|[?])`);
	}
	let F = P("print") ? P("steps") ? "steps" : "slides" : !1, I = r(ti, {
		slides: b,
		rawSlideSources: O,
		transition: o,
		transitionDuration: s,
		designWidth: c,
		designHeight: l,
		author: u,
		seed: f,
		raw: E,
		components: te,
		presenter: re,
		print: F
	});
	I.config.globalProperties.$sp = V, I.provide("sp-api", V), I.provide("sp-registry", ve);
	let L = T(0);
	I.provide("liveUpdatesCount", L), typeof globalThis < "u" && (globalThis.__sp__ = V);
	let R = I.mount(N);
	if (ta(n.jsMounted), I.use = async (e) => (await ve.register(e), R.rebuildKeymap(), I), typeof EventSource < "u") {
		let e = new EventSource("/__sp_events"), t = (e) => {
			let t = 0;
			for (let n of e) t = (t << 5) - t + n.charCodeAt(0), t |= 0;
			return t;
		}, n = parseInt(window.localStorage.getItem("sp-non-content-hash") ?? "0", 10);
		e.addEventListener("update", (e) => {
			L.value++;
			let r = (e.data ?? "").trim();
			r ? Xe(r) : Ye();
			let i = window.location.href.substring(0, window.location.href.length - window.location.hash.length);
			fetch(i + "?_=" + Date.now()).then((e) => e.text()).then((e) => {
				let r = t(e.replace(/<script\s+type="text\/html"\s+id="sp-content">[\s\S]*?<\/script>/, ""));
				if (n !== 0 && n !== r) {
					window.localStorage.setItem("sp-non-content-hash", r.toString());
					try {
						sessionStorage.setItem("sp-live-overview", V.overview ? "1" : "0");
					} catch {}
					It(!0), window.location.reload();
					return;
				}
				n = r;
				let i = e.match(/<script\s+type="text\/html"\s+id="sp-content">([\s\S]*?)<\/script>/);
				i && (async () => {
					let e = await tt(i[1]);
					xe(), R.updateSlides?.(e), ee(e), await h(), It();
				})().catch(() => {});
			}).catch(() => {});
		}), e.addEventListener("connected", () => {
			V.devServer = !0;
		}, { once: !0 }), e.addEventListener("typst-error", (e) => {
			xe();
			try {
				let t = JSON.parse(e.data ?? "[]");
				(Array.isArray(t) ? t : [t]).forEach((e) => U(e));
			} catch {}
		});
	}
	return I.export = Dr, I;
}
//#endregion
export { ni as SpAlternatives, ri as SpAnim, Vi as SpBib, ui as SpDrag, pi as SpImg, zi as SpInclude, ti as SpPresentation, On as SpSlide, Pi as SpSlideSource, hi as SpStyle, Ai as SpSvg, xi as SpToc, Ti as addViewBox, gt as bind, jt as chunkPlacementMode, _t as createDefaultKeymap, oa as createSlidesPurryst, ki as defaultTransformers, ye as definePlugin, Dr as exportStandalone, Di as idRewrite, _e as injectStyle, ge as listAnimActionTypes, me as listAnimCommands, Ne as maybeProcessed, H as parseArgs, kt as parseChunklets, Ot as parseChunkletsFromText, ae as parseElementToSlides, G as processSlideHtml, he as registerAnimActionType, pe as registerAnimCommand, ve as registry, Et as resetConfig, V as spApi, Oi as styleToAttributes, At as substituteParams, Xn as useElementScale, ht as useKeymap, vt as useNavigation, yt as usePresenter, bt as useScale, gi as useSlideTree, se as useSlides, K as useSteps, Tt as useStorage, Ei as xlinkRewrite };
