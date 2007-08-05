from umitCore.UmitConf import CommandProfile
from umitCore.NmapCommand import CommandConstructor
from umitWeb.Http import HttpResponse, HttpError, Http500
from umitWeb.Auth import authenticate, ERROR

@authenticate(ERROR)
def add(req):
    if not req.POST:
        raise HttpError(400, "Ivalid Request.")
    
    profile = CommandProfile()
    profile_name = req.POST["name"]
    command = req.POST["command"]
    hint = req.POST.get("hint", "")
    description = req.POST.get("description", "")
    annotation = req.POST.get("annotation", "")
    profile.add_profile(profile_name,
                        command=command.replace("<target>", "%s"),
                        hint=hint,
                        description=description,
                        annotation=annotation,
                        options={})
    #options=constructor.get_options())
    return HttpResponse("OK")
    
