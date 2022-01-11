import { RequestFunc } from "../constants";

export type InitConfig = {
  uid: string;
  token: string;
  url: string;
  platformID: number;
  operationID?: string;
};

export type WsParams = {
  reqFuncName: RequestFunc;
  operationID: string;
  uid: string | undefined;
  data: any;
};

export type WsResponse = {
  event: RequestFunc;
  errCode: number;
  errMsg: string;
  data: any;
  operationID: string;
};

export type LoginParams = {
  uid: string;
  token: string;
};

export type UserInfo = {
  name?: string;
  icon?: string;
  gender?: number;
  mobile?: string;
  birth?: string;
  email?: string;
  ex?: string;
};

export type AtMsgParams = {
  text: string;
  atUserList: string[];
};

export type ImageMsgParams = {
  sourcePicture: PicBaseInfo;
  bigPicture: PicBaseInfo;
  snapshotPicture: PicBaseInfo;
};

export type PicBaseInfo = {
  uuid: string;
  type: string;
  size: number;
  width: number;
  height: number;
  url: string;
};

export type SoundMsgParams = {
  uuid: string;
  soundPath: string;
  sourceUrl: string;
  dataSize: number;
  duration: number;
};

export type VideoMsgParams = {
  videoPath: string;
  duration: number;
  videoType: string;
  snapshotPath: string;
  videoUUID: string;
  videoUrl: string;
  videoSize: number;
  snapshotUUID: string;
  snapshotSize: number;
  snapshotUrl: string;
  snapshotWidth: number;
  snapshotHeight: number;
};

export type FileMsgParams = {
  filePath: string;
  fileName: string;
  uuid: string;
  sourceUrl: string;
  fileSize: number;
};

export type MergerMsgParams = {
  messageList: Message[];
  title: string;
  summaryList: string[];
};

export type Message = {
  clientMsgID: string;
  serverMsgID: string;
  createTime: number;
  sendTime: number;
  sessionType: number;
  sendID: string;
  recvID: string;
  msgFrom: number;
  contentType: number;
  platformID: number;
  forceList: string | null;
  senderNickName: string;
  senderFaceUrl: string;
  groupID: string;
  content: string;
  seq: number;
  isRead: boolean;
  status: number;
  remark: string;
  pictureElem: PictureElem;
  soundElem: SoundElem;
  videoElem: VideoElem;
  fileElem: FileElem;
  mergeElem: MergeElem;
  atElem: AtElem;
  locationElem: LocationElem;
  customElem: CustomElem;
  quoteElem: QuoteElem;
};

export type AtElem = {
  text: string;
  atUserList: string[] | null;
  isAtSelf: boolean;
};

export type CustomElem = {
  data: string;
  description: string;
  extension: string;
};

export type FileElem = {
  filePath: string;
  uuid: string;
  sourceUrl: string;
  fileName: string;
  fileSize: number;
};

export type LocationElem = {
  description: string;
  longitude: number;
  latitude: number;
};

export type MergeElem = {
  title: string;
  abstractList: string[] | null;
  multiMessage: Message[];
};

export type PictureElem = {
  sourcePath: string;
  sourcePicture: Picture;
  bigPicture: Picture;
  snapshotPicture: Picture;
};

export type Picture = {
  uuid: string;
  type: string;
  size: number;
  width: number;
  height: number;
  url: string;
};

export type QuoteElem = {
  quoteMessage: Message;
  text: string;
};

export type SoundElem = {
  uuid: string;
  soundPath: string;
  sourceUrl: string;
  dataSize: number;
  duration: number;
};

export type VideoElem = {
  videoPath: string;
  videoUUID: string;
  videoUrl: string;
  videoType: string;
  videoSize: number;
  duration: number;
  snapshotPath: string;
  snapshotUUID: string;
  snapshotSize: number;
  snapshotUrl: string;
  snapshotWidth: number;
  snapshotHeight: number;
};

export type LocationMsgParams = {
  description: string;
  longitude: number;
  latitude: number;
};

export type CustomMsgParams = {
  data: string;
  extension: string;
  description: string;
};

export type QuoteMsgParams = {
  text: string;
  message: string;
};

export type SendMsgParams = {
  recvID: string;
  groupID: string;
  onlineUserOnly: boolean;
  message: string;
};

export type GetHistoryMsgParams = {
  userID: string;
  groupID: string;
  count: number;
  startMsg: Message | null;
};

export type InsertSingleMsgParams = {
  message: string;
  userID: string;
  sender: string;
};

export type TypingUpdateParams = {
  receiver: string;
  msgTip: string;
};

export type MarkC2CParams = {
  receiver: string;
  msgIDList: string[];
};

export type GetOneCveParams = {
  sourceID: string;
  sessionType: number;
};

export type SetDraftParams = {
  conversationID: string;
  draftText: string;
};

export type PinCveParams = {
  conversationID: string;
  isPinned: boolean;
};

export type AddFriendParams = {
  uid: string;
  reqMessage: string;
};

export type SetFriendParams = {
  uid: string;
  comment: string;
};

export type InviteGroupParams = {
  groupId: string;
  reason: string;
  userList: string[];
};

export type GetGroupMemberParams = {
  groupId: string;
  filter: number;
  next: number;
};

export type CreateGroupParams = {
  gInfo: Omit<GroupInfo, "groupId">;
  memberList: Member[];
};

export type Member = {
  uid: string;
  setRole: number;
};

export type GroupInfo = {
  groupId: string;
  groupName: string;
  introduction: string;
  notification: string;
  faceUrl: string;
};

export type JoinGroupParams = {
  groupId: string;
  message: string;
};

export type TransferGroupParams = {
  groupId: string;
  userId: string;
};

export type AccessGroupParams = {
  application: string;
  reason: string;
};

export type Ws2Promise = {
  oid: string;
  mname: string;
  mrsve: (value: WsResponse | PromiseLike<WsResponse>) => void;
  mrjet: (reason?: any) => void;
  flag: boolean;
};
