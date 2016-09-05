(function() {(window.nunjucksPrecompiled = window.nunjucksPrecompiled || {})["text.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = null;
output += "\r\n\r\n<div class=\"col-";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"size"), env.opts.autoescape);
output += "\">\r\n\t<label>\r\n\t";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"label"), env.opts.autoescape);
output += "\r\n\t</label>\r\n\t<input type=\"text\" value=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"value"), env.opts.autoescape);
output += "\" name=\"fields[]";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"depth"), env.opts.autoescape);
output += "[";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"name"), env.opts.autoescape);
output += "]\" placeholder=\"";
output += runtime.suppressValue(runtime.memberLookup((runtime.contextOrFrameLookup(context, frame, "field")),"placeholder"), env.opts.autoescape);
output += "\">\r\n\t";
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
