import { useEffect, useRef, useState } from "react";
import { Element,scroller } from 'react-scroll'
import { Loading } from "../components/Loading";
import './test.less'

 const Test = () => {
    const [data,setData ] = useState(Array.from({ length: 20 }))
    const [hasMore,setHasMore] = useState(true)
    const scrRef = useRef<any>(null)
    useEffect(()=>{
        scroller.scrollTo('msg_btm',{
            duration: 0,
            delay: 0,
            smooth: true,
            containerId:'scr_container'
        })
        
    },[])

    const onScroll = (e:any)=> {
        const loadThreshold = e.target.scrollHeight - 666
        if(e.target.scrollTop<loadThreshold){
            fetchMoreData()
        }
    }

    const fetchMoreData = () => {
        if (data.length >= 100) {
          setHasMore(false)
          return;
        }
        // a fake async api call like which sends
        // 20 more records in .5 secs
        setTimeout(() => {
            const newData = [...data,...Array.from({ length: 20 })]
            setData(newData)
        }, 1500);
      };

    return (
        <div ref={scrRef} onScroll={onScroll} id="scr_container" className="con">
            <Element name="msg_btm"/>
            {
                data.map((d,idx)=><Element key={idx} name={idx+''}>
                    <div className="con_item">{`item ${idx}`}</div>
                </Element>)
            }
            {
                hasMore?<Loading
                style={{ backgroundColor: "transparent" }}
                size={data.length === 0 ? "large" : "small"}
                height={data.length === 0 ? "716px" : "60px"}
              />:<div className="con_nomore">没有更多啦~</div>
            }
        </div>
    )
}

export default Test;