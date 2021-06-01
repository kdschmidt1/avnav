#the following import is optional
#it only allows "intelligent" IDEs (like PyCharm) to support you in using it
from avnav_api import AVNApi
from avnav_util import *


class Plugin(object):
  PATH="ais"

  @classmethod
  def pluginInfo(cls):
    """
    the description for the module
    @return: a dict with the content described below
            parts:
               * description (mandatory)
               * data: list of keys to be stored (optional)
                 * path - the key - see AVNApi.addData, all pathes starting with "gps." will be sent to the GUI
                 * description
    """
    return {
      'description': 'a test plugins',
      'data': [
        {
          'path': cls.PATH,
          'description': 'output of testdecoder',
        }
      ]
    }

  def __init__(self,api):
    """
        initialize a plugins
        do any checks here and throw an exception on error
        do not yet start any threads!
        @param api: the api to communicate with avnav
        @type  api: AVNApi
    """
    self.api = api # type: AVNApi
    #we register an handler for API requests
    self.api.registerRequestHandler(self.handleApiRequest)
    self.count=0
    self.aisWarningCpa=float(api.getConfigValue('aisWarningCpa', 500*0.000539957)) #NM
    self.minAISspeed=float(api.getConfigValue('minAISspeed', '0.1')) #KN
    self.aisDistance=float(api.getConfigValue('aisDistance', '20')) #NM
    self.maxAisErrors=float(api.getConfigValue('maxAisErrors', '100'))
    self.aisWarningTpa=float(api.getConfigValue('aisWarningTpa', '900'))    #SEK
    self.aisQueryTimeout=float(api.getConfigValue('aisQueryTimeout', '10'))

    self.api.registerRestart(self.stop)

  def stop(self):
    pass

  def run(self):
    """
    the run method
    this will be called after successfully instantiating an instance
    this method will be called in a separate Thread
    The example simply counts the number of NMEA records that are flowing through avnav
    and writes them to the store every 10 records
    @return:
    """
    seq=0
    self.api.log("started")
    self.api.setStatus('NMEA','running')
    aisalarm={}
    aisalarm['running']=False
    alarmhandler=self.api.phandler.findHandlerByName("AVNAlarmHandler")

    while not self.api.shouldStopMainThread():
      seq,data=self.api.fetchFromQueue(seq,10)
      rtx=self.api.getDataByPrefix('ais')
      """
      keys.properties.aisWarningCpa
      keys.properties.minAISspeed
      keys.properties.aisDistance
      keys.properties.maxAisErrors
      keys.properties.aisWarningTpa
      keys.properties.aisQueryTimeout
      """

      if (rtx == {}):
          xy=1
          continue
      rt=rtx.copy()
      aisalarm['ships']=0  
      if len(rt) > 0:
        for key in rt:
          aisTarget={}
          aisdata=rt[key]
          #print(aisdata.keys())
          if(len(aisdata.keys())<10):
              continue
          if(not 'lat' in aisdata):
             continue
          aisTarget['lat']=float(aisdata['lat'])/600000
          aisTarget['lon']=float(aisdata['lon'])/600000
          if(not 'speed' in aisdata):
              aisdata['speed']=aisdata.get('speed',self.minAISspeed) # if speed is not existing
          aisTarget['speed']=(float(aisdata['speed'] or 0)/10) * 1852.0/3600
          aisTarget['course']=float(aisdata.get('course',0))/10 # if course is not existing
          #aisTarget['course']=float(aisdata['course'] or 0)/10
          boatdata=self.api.getDataByPrefix('gps')
          if(not 'lat' in boatdata):
              continue
          boatdata['course']=0
          if('track' in boatdata):
              boatdata['course'] = boatdata['track']
          if(aisdata['mmsi']=='211757020'):
              test=99
          dst=AVNUtil.distanceM( (boatdata['lat'],boatdata['lon']),(aisTarget['lat'],aisTarget['lon']) )*1000 #m
          dst /= 1000 #distance in km
          cpadata=self.computeCpa(boatdata,aisTarget)
          ais={}
          ais['mmsi']=aisdata['mmsi']
          ais['distance'] = cpadata['curdistance']*0.000539957# von m in nm
          ais['headingTo'] = cpadata['courseToTarget']
          if ('tcpa' in cpadata and 'cpa' in cpadata) :
            ais['cpa'] = cpadata['cpa']*0.000539957# von m in nm
            ais['tcpa'] = cpadata['tcpa']# in sek
          else:
            ais['cpa'] = 0;
            ais['tcpa'] = 0;
          """  
          if('front'in cpadata):
            ais['passFront'] = cpadata['front'];
          if(not 'shipname' in ais.keys() ):
            ais['shipname'] = "unknown"
          if(not 'callsign' in ais.keys() ):
            ais['callsign'] = "????"
          #if(aisdata['mmsi']=='211757020'):
              #print("ais: ",ais)
          """  
          #warningCpa=500*0.000539957    #nm    
          #aisWarningTpa=900 #sek   
          #aisDistance = 20  #nm
          if (ais['distance'] < self.aisDistance and ais['cpa'] and ais['cpa'] < self.aisWarningCpa and ais['tcpa'] and ais['tcpa'] >0 and math.fabs(ais['tcpa']) < self.aisWarningTpa):
              #print("AISALARM",aisdata['mmsi'])
              aisalarm['ships']+=1


              
        if(aisalarm['ships']):
            #print("AISALARM",aisalarm['ships'])
            if(not aisalarm['running']):
                print("START AISALARM")
                alarmhandler.startAlarm('ais')
                aisalarm['running']=True
        else:
            if(aisalarm['running']):
                print("STOP AISALARM")
                alarmhandler.stopAlarm('ais')
                aisalarm['running']=False
            
        #self.count+=1
        #if self.count%10 == 0:
            #self.api.addData(self.PATH,self.count)
            #self.api.addData("wrong.path",count) #this would be ignored as we did not announce our path - and will write to the log


  def handleApiRequest(self,url,handler,args):
    """
    handler for API requests send from the JS
    @param url: the url after the plugin base
    @param handler: the HTTP request handler
                    https://docs.python.org/2/library/basehttpserver.html#BaseHTTPServer.BaseHTTPRequestHandler
    @param args: dictionary of query arguments
    @return:
    """
    if url == 'test':
      return {'status':'OK'}
    if url == 'reset':
      self.count=0
      self.api.addData(self.PATH, self.count)
      return {'status': 'OK'}
    return {'status','unknown request'}

    """
/**
 * compute the CPA point
 * returns src.lon,src.lat,dst.lon,dst.lat,cpa(m),cpanm(nm),tcpa(s),front (true if src reaches intersect point first)
 * each of the objects must have: lon,lat,course,speed
 * lon/lat in decimal degrees, speed in kn
 * we still have to check if the computed tm is bigger then our configured one
 * //update
 * if one of the partners has no real speed minAISSpeed
 * we need to change the computation - just compute the orthogonal distance of the point to the other
 * course line
 * @param src
 * @param dst
 * @param properties - settings
 * @returns {navobjects.Cpa}
 */
    """

  def computeCpa(self,src,dst):
#NavCompute.computeCpa=function(src,dst,properties){
    #let rt = new navobjects.Cpa();
    llsrc=src.copy()
    #let llsrc = new LatLon(src.lat, src.lon);
    lldst = dst.copy;
        
    curdistance=AVNUtil.distanceM( (src['lat'],src['lon']),(dst['lat'],dst['lon']) )*1000 #m
    curdistance /= 1000 #distance in km
    rt={}
    rt['curdistance']=curdistance;

    courseToTarget=AVNUtil.calcBearing((src['lat'],src['lon']),(dst['lat'],dst['lon']))
    rt['courseToTarget']=courseToTarget
    #default to our current distance
    tcpa=0;
    cpa=curdistance;
    maxDistance=6371000*1000*math.pi #half earth
    #minAISspeed=0.1
    if not 'speed' in src:
        test=1
    src['speed']=src.get('speed',self.minAISspeed) # if speed is not existing
    appr=self.computeApproach(courseToTarget,curdistance,src['course'],src['speed'],dst['course'],dst['speed'],self.minAISspeed,maxDistance)
    if ('dd' in appr.keys() and 'ds' in appr.keys()) :
        xpoint = self.destinationPoint(src, src['course'], appr['dd'] / 1000);
        rt['crosspoint'] = xpoint
    try:
        if (not appr['tm']):
            rt['tcpa']=0; #/better undefined
            rt['cpa']=curdistance;
            rt['front']=-1;
            return rt;
    except:
        self.api.error(" tm key error in appr=" + appr)
    cpasrc = self.destinationPoint(src,src['course'], appr['dms']/1000);
    cpadst = self.destinationPoint(dst,dst['course'], appr['dmd']/1000);
    rt['src']=cpasrc
    rt['dst']=cpadst['lon']
    rt['cpa'] = AVNUtil.distanceM( (cpasrc['lat'],cpasrc['lon']),(cpadst['lat'],cpadst['lon']) )*1000 #m(cpadst, 5) * 1000;
    rt['cpa']/=1000 #umrechnung in km
    rt['tcpa'] = appr['tm'];
    if (rt['cpa'] > curdistance or appr['tm'] < 0):
        rt['cpa']=curdistance;
        #//rt.tcpa=0;
    
    if ('td' in appr.keys() and 'ts' in appr.keys()):
        if(appr['ts']<appr['td']):
            rt['front']= 1
        else:
            rt['front']= 0;
    
    else:
        if (appr['tm'] >0):
             rt['front']=-1; #//we do not cross but will still aproach
        else:
             if('front' in rt):
                rt.pop('front')
    
    return rt;

    """

/**
 * do the computation of the cross point and the closest approach
 * all units are Si units (m, s,...), angles in degrees
 * @param courseToTarget
 * @param curdistance
 * @param srcCourse
 * @param srcSpeed
 * @param dstCourse
 * @param dstSpeed
 * @param minAisSpeed - minimal speed we allow for crossing computation
 * @param maxDistance
 * @returns {object} an object with the properties
 *        td - time dest to crosspoint (if crossing)
 *        ts - time src to crosspoint (if crossing)
 *        dd - distance destination to crosspoint
 *        ds - distance src to crosspoint
 *        tm - TCPA
 *        dms - distance src to cpa point
 *        dmd - distance dest to cpa point
 */
    """

  def computeApproach(self,courseToTarget,curdistance,srcCourse,srcSpeed,dstCourse,dstSpeed,minAisSpeed,maxDistance):
    #//courses
    rt={}
    ca=(courseToTarget-srcCourse)/180*math.pi #rad
    cb=(courseToTarget-dstCourse)/180*math.pi
    cosa=math.cos(ca)
    sina=math.sin(ca)
    cosb=math.cos(cb)
    sinb=math.sin(cb)
    if (dstSpeed > minAisSpeed and srcSpeed > minAisSpeed ):
        #//compute crossing
        divisor=(dstSpeed * (cosa / sina * sinb - cosb))
        if( divisor != 0):    
            rt['td'] = curdistance / (dstSpeed * (cosa / sina * sinb - cosb));
        else:
            test=0    
        divisor=(srcSpeed*(cosa-sina*cosb/sinb))    
        if( divisor != 0):    
            rt['ts']=curdistance/(srcSpeed*(cosa-sina*cosb/sinb));
        else:
            test=0    
        if('td' in rt and 'ts' in rt):
            rt['ds']=srcSpeed*rt['ts']; #in m
            rt['dd']=dstSpeed*rt['td']; #in m
            if (math.fabs(rt['ds']) > maxDistance or math.fabs(rt['dd']) > maxDistance):
                rt.pop('td')
                rt.pop('ts')
                rt.pop('ds')
                rt.pop('dd')
    quot=(srcSpeed*srcSpeed+dstSpeed*dstSpeed-2*srcSpeed*dstSpeed*(cosa*cosb+sina*sinb));
    if (quot < 1e-6 and quot > -1e-6):
        if 'tm' in rt:
            rt.pop('tm')
        return rt;
    rt['tm']=curdistance*(cosa*srcSpeed-cosb*dstSpeed)/quot;
    rt['dms']=srcSpeed*rt['tm'];
    rt['dmd']=dstSpeed*rt['tm'];
    return rt;

    """
/**
 * Returns the destination point from this point having travelled the given distance (in km) on the 
 * given initial bearing (bearing may vary before destination is reached)
 *
 *   see http://williams.best.vwh.net/avform.htm#LL
 *
 * @param   {Number} brng: Initial bearing in degrees
 * @param   {Number} dist: Distance in km
 * @returns {LatLon} Destination point
 */
    """
  def destinationPoint(self, src, brng, dist):
#LatLon.prototype.destinationPoint = function(brng, dist) {
#  dist = typeof(dist)=='number' ? dist : typeof(dist)=='string' && dist.trim()!='' ? +dist : NaN;
        dist = dist/6371;  #// convert dist to angular distance in radians
        brng = math.radians(brng) 
        lat1 = math.radians(src['lat'])
        lon1 = math.radians(src['lon'])

        lat2 = math.asin( math.sin(lat1)*math.cos(dist) +math.cos(lat1)*math.sin(dist)*math.cos(brng) );
        lon2 = lon1 + math.atan2(math.sin(brng)*math.sin(dist)*math.cos(lat1),math.cos(dist)-math.sin(lat1)*math.sin(lat2));
        lon2 = (lon2+3*math.pi) % (2*math.pi) - math.pi;  #// normalise to -180..+180º
        rt={}
        rt['lat']=lat2*180/math.pi
        rt['lon']=lon2*180/math.pi
        return rt


        """
  def computeDistance(self, src, dst):
    let srcll=src;
    let dstll=dst;
    let rt=new navobjects.Distance();
    //use the movable type stuff for computations
    let llsrc=new LatLon(srcll.lat,srcll.lon);
    let lldst=new LatLon(dstll.lat,dstll.lon);
    rt.dts=llsrc.distanceTo(lldst,5); #in m
    rt.course=llsrc.bearingTo(lldst);
    return rt;
};
        """
