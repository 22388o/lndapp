import React from 'react'

const Loading = ({ width, height }) => {
    return (
        <svg version="1.1" id="Layer_1" x="0px" y="0px" preserveAspectRatio="none"
            width={width} height={height} viewBox="0 0 252 252" enableBackground="new 0 0 340 333">

            <linearGradient id='grad'>
            <stop stopColor='#479CFF'/>
            <stop offset='100%' stopColor='black'/>
        </linearGradient>
        
        <path className="path" fill="#FFFFFF" stroke="red" strokeWidth="3" strokeMiterlimit="10" d="M105,-80.5002679 C105,-80.6555428 105,-80.9659925 105,-81.1212675 C105.308275,-91.8326334 113.939877,-100.681181 124.729366,-100.991671 C130.278184,-101.146896 135.672929,-99.1288223 139.680519,-95.2478806 C143.688009,-91.3669088 146,-86.0888633 146,-80.3450931 C146,-75.5326721 144.3046,-70.875526 141.221846,-67.1498291 C135.056438,-59.6984354 128.120366,-55.6622888 128.120366,-46.1927216 L128.120366,-45.726997 C128.120366,-36.4128049 135.056438,-32.3765582 141.221846,-24.7699897 C144.3046,-21.0442929 146,-16.3871467 146,-11.5747257 C146,-6.7624048 144.3046,-2.1055592 141.221846,1.62003748 C134.902265,9.22750756 127.966193,13.2636541 127.966193,22.5771449 L127.966193,22.8876948 C127.966193,32.2021874 134.902265,36.3936089 141.221846,43.8448023 C144.3046,47.570399 146,52.2276453 146,57.0401665 C146,61.8526877 144.3046,66.509934 141.221846,70.2355307 C134.902265,77.841999 127.19553,81.8781456 127.19553,91.1926382 C127.19553,100.507131 134.902265,104.698552 141.221846,112.149746 C144.3046,115.875342 146,120.532589 146,125.34511 C146,130.933004 143.842182,136.21135 139.680519,140.247497 C135.672929,144.128368 130.278184,146.146942 124.729366,145.991667 C114.094049,145.525843 105.462418,136.677175 105.154143,125.96621 C105.154143,125.810935 105.154143,125.500385 105.154143,125.34511 C105.154143,120.377314 106.849642,115.564792 110.086479,111.839196 C116.251868,104.698552 123.033867,101.128231 123.033867,92.1242878 L123.033867,90.7268134 C123.033867,81.4123208 116.097795,77.3761742 109.932347,69.7697059 C106.849632,66.0441092 105.154143,61.3868629 105.154143,56.5743417 C105.154143,51.7618205 106.849632,47.1045742 109.932347,43.3789775 C116.251868,35.7725092 123.188039,31.7363626 123.188039,22.42187 L123.188039,22.1113201 C123.188039,12.7978293 116.251868,8.60640782 109.932347,1.15521445 C106.849632,-2.57138401 105.154143,-7.22812943 105.154143,-12.0404503 C105.154143,-16.8528714 106.849632,-21.5100175 109.932337,-25.2357143 C116.097795,-32.6871081 123.033867,-36.7232546 123.033867,-46.1927216 C123.033867,-55.9727385 116.251868,-60.16416 110.086469,-67.305104 C106.849632,-70.875526 105,-75.5326721 105,-80.5002679 Z"/>
        
        </svg>
    )
}

export default Loading