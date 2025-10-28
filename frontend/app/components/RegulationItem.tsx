import { Pressable, View ,Text} from "react-native";


export default function RegulationItem({onPress,item}:{onPress:()=>void,item:string}){
    return (
        <Pressable style={{
            display:"flex",
            backgroundColor:"black",
            width:"30%",
            aspectRatio:0.7,
            borderRadius:15,
            justifyContent:"center",
            alignItems:"center"
        }} onPress={onPress}>
            <Text style={{color:"white",fontWeight:900,fontSize:28,textAlign:"center"}}>{item}</Text>
        </Pressable>
    )
}