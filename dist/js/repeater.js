(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["repeater.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "\r\n\r\n<div class=\"col-12\">\r\n\t<div class=\"repeater\" data-depth=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"depth"), env.opts.autoescape);
output += "\">\r\n\t\t<label>\r\n\t\t";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"label"), env.opts.autoescape);
output += "\r\n\t\t</label>\r\n\t\t<div class=\"form-row\">\r\n\t\t";
frame = frame.push();
var t_3 = runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"fields");
if(t_3) {var t_2 = t_3.length;
for(var t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1];
frame.set("field", t_4);
frame.set("loop.index", t_1 + 1);
frame.set("loop.index0", t_1);
frame.set("loop.revindex", t_2 - t_1);
frame.set("loop.revindex0", t_2 - t_1 - 1);
frame.set("loop.first", t_1 === 0);
frame.set("loop.last", t_1 === t_2 - 1);
frame.set("loop.length", t_2);
output += "\r\n\t\t\t";
env.getTemplate("partials/form/" + runtime.memberLookup((t_4),"type") + ".html", false, "repeater.html", null, function(t_7,t_5) {
if(t_7) { cb(t_7); return; }
t_5.render(context.getVariables(), frame, function(t_8,t_6) {
if(t_8) { cb(t_8); return; }
output += t_6
output += "\r\n\t\t";
})});
}
}
frame = frame.pop();
output += "\r\n\t\t</div>\r\n\t</div>\r\n</div>";
if(parentTemplate) {
parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);
} else {
cb(null, output);
}
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
})();
