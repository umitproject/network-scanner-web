from umitWeb.Auth import authenticate, ERROR
from umitCore.UmitConf import CommandProfile
from umitWeb.Http import HttpResponse
from umitWeb.ProfileParser import ProfileEditorParser, WizardParser

@authenticate(ERROR)
def get_profiles(req):
    profile = CommandProfile()
    profiles = profile.sections()
    response = HttpResponse()
    response['Content-type'] = "text/plain"
    ret = []
    for section in profiles:
        ret.append([section, profile.get_command(section) % "<target>"])
    response.write(str(ret))
    return response


@authenticate(ERROR)
def get_wizard_options(req):
    wp = WizardParser()
    return HttpResponse(wp.to_json(), "text/plain")


@authenticate(ERROR)
def get_profile_editor_options(req):
    pep = ProfileEditorParser()
    return HttpResponse(pep.to_json(), "text/plain")