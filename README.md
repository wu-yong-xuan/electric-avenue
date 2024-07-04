# CityGenerator

### Keybinds just for debugging for now:
i -> iterate the map (extends road network and REgenerates blocks). Currently block states are not carried over\
spacebar -> iterate the road network without generating blocks\
left click -> on the center of a block will change the block state from unoccupied <-> occupied\
e -> on a center to change the state powered <-> unpowered\
r -> reset the network\
s -> save network settings into a json file\
q -> generate and save an svg file of the network\
p -> pathfind
-  first time you click p on the center of a block, it will select a node on one of the corners (highlighted in black). This is the starting node
-  Second time you click p on a block, it will select a node on the edge of the block. this is the destination node
-  third time you click it will show the path given by the alghorithm. It uses a super accurate heuristic (which might as well be an alghorithm) so it should like 99.999% of the time generate the true best route. 
-  if it fails to select a node it will just try to select it again the next time you click p
