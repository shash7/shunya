(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["toggle.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "\r\n";
var t_1;
t_1 = env.getFilter("generateId").call(context, runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"name"));
frame.set("id", t_1, true);
if(frame.topLevel) {
context.setVariable("id", t_1);
}
if(frame.topLevel) {
context.addExport("id", t_1);
}
output += "\r\n<div class=\"col-";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"size"), env.opts.autoescape);
output += "\">\r\n\t<label>\r\n\t";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"label"), env.opts.autoescape);
output += "\r\n\t</label>\r\n\r\n\t<div class=\"onoffswitch\">\r\n\t\t<input type=\"checkbox\" name=\"fields[]";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"depth"), env.opts.autoescape);
output += "[";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"name"), env.opts.autoescape);
output += "]\" class=\"onoffswitch-checkbox\" id=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"), env.opts.autoescape);
output += "\" value=true ";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"value")) {
output += "checked";
;
}
output += ">\r\n\t\t<label class=\"onoffswitch-label\" for=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "id"), env.opts.autoescape);
output += "\">\r\n\t\t\t<span class=\"onoffswitch-inner\"></span>\r\n\t\t\t<span class=\"onoffswitch-switch\"></span>\r\n\t\t</label>\r\n\t</div>\r\n\r\n\t";
if(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"description")) {
output += "\r\n\t<span class=\"form-description\">\r\n\t";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"description"), env.opts.autoescape);
output += "\r\n\t</span>\r\n\t";
;
}
output += "\r\n</div>";
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
