export const findEmptyValue = (obj: any) => {
  let flag = true;
  for (let key in obj) {
    if (obj[key] === "") {
      flag = false;
    }
  }
  return flag;
};

export const pySegSort = (arr: any[]) => {
  if (arr.length == 0) return;
  if (!String.prototype.localeCompare) return null;
  var letters = "#ABCDEFGHJKLMNOPQRSTWXYZ".split("");
  var zh = "阿八嚓哒妸发旮哈讥咔垃痳拏噢妑七呥扨它穵夕丫帀".split("");
  var segs: any = []; // 存放数据
  var res: any = {};
  let curr: any;
  var re = /[^\u4e00-\u9fa5]/; //中文正则
  var pattern = new RegExp("[`\\-~!@#$^&*()=|{}':;',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？12345678990]"); //特殊符号

  letters.filter((items, i) => {
    curr = {
      initial: "", //字母
      data: [], //数据
    };
    arr.map((v, index) => {
      // 特殊字符
      if (pattern.test(v.name[0])) {
        if ((!zh[i - 1] || zh[i - 1].localeCompare(v.name) <= 0) && v.name.localeCompare(zh[i]) == -1) {
          curr.data.push(v);
        }
      }
      // 判断首个字是否是中文
      if (re.test(v.name[0])) {
        // 英文
        if (v.name[0].toUpperCase() == items) {
          curr.data.push(v);
        }
      } else {
        // 中文
        if ((!zh[i - 1] || zh[i - 1].localeCompare(v.name) <= 0) && v.name.localeCompare(zh[i]) == -1) {
          curr.data.push(v);
        }
      }
    });

    if (curr.data.length) {
      curr.initial = letters[i];
      segs.push(curr);
      curr.data.sort((a: any, b: any) => {
        return a.name.localeCompare(b.name);
      });
    }
  });
  res.segs = Array.from(new Set(segs)); //去重
  // console.log(res.segs);
  const lastData = res.segs.shift();
  res.segs.push(lastData);
  return res;
};

export const formatDate = (timestamp: number) => {
  const now = new Date(timestamp);
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const hour = now.getHours();
  let minute: any = now.getMinutes();
  if (minute.toString().length === 1) minute = "0" + minute;
  let second: any = now.getSeconds();
  if (second.toString().length === 1) second = "0" + second;
  const str1 = year + "-" + month + "-" + date;
  // const str2 = hour + ":" + minute + ":" + second
  const str2 = hour + ":" + minute;
  return [year, month, date, str1, str2];
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getUserIP = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    var RTCPeerConnection = window.RTCPeerConnection;
    if (RTCPeerConnection) {
      var rtc = new RTCPeerConnection({ iceServers: [] });
      // @ts-ignore
      rtc.createDataChannel("", { reliable: false });
      rtc.onicecandidate = function (evt) {
        if (evt.candidate) grepSDP("a=" + evt.candidate.candidate);
      };
      rtc.createOffer(
        function (offerDesc) {
          grepSDP(offerDesc.sdp);
          rtc.setLocalDescription(offerDesc);
        },
        function (e) {
          console.warn("offer failed", e);
        }
      );
      var addrs = Object.create(null);
      addrs["0.0.0.0"] = false;
      function updateDisplay(newAddr: any) {
        if (newAddr in addrs) return;
        else addrs[newAddr] = true;
        var displayAddrs = Object.keys(addrs).filter(function (k) {
          return addrs[k];
        });
        for (var i = 0; i < displayAddrs.length; i++) {
          if (displayAddrs[i].length > 16) {
            displayAddrs.splice(i, 1);
            i--;
          }
        }
        resolve(displayAddrs[0]);
      }
      function grepSDP(sdp: any) {
        var hosts = [];
        sdp.split("\r\n").forEach(function (line: any, index: any, arr: any) {
          if (~line.indexOf("a=candidate")) {
            const parts = line.split(" ");
            const addr = parts[4];
            const type = parts[7];
            if (type === "host") updateDisplay(addr);
          } else if (~line.indexOf("c=")) {
            const parts = line.split(" ");
            const addr = parts[2];
            updateDisplay(addr);
          }
        });
      }
    } else {
      reject("none");
    }
  });
};

export const inElectron = ():boolean => {
  //@ts-ignore
  return window && window.process && window.process.versions && window.process.versions['electron']
}