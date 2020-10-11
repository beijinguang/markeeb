LevelDB

LevelDb是能够处理十亿级别规模Key-Value型数据持久性存储的C++ 程序库。LevelDB的数据是存储在磁盘上的，采用[LSM-Tree](http://ov6v82oa9.bkt.clouddn.com/download.pdf)的结构实现。LSM-Tree将磁盘的随机写转化为顺序写，从而大大提高了写速度。

LevelDb有如下一些特点：

　　　　首先，LevelDb是一个持久化存储的KV系统，和Redis这种内存型的KV系统不同，LevelDb不会像Redis一样狂吃内存，而是将大部分数据存储到磁盘上。

　　　　其次，LevleDb在存储数据时，是根据记录的key值有序存储的，就是说相邻的key值在存储文件中是依次顺序存储的，而应用可以自定义key大小比较函数，LevleDb会按照用户定义的比较函数依序存储这些记录。

　　　　再次，像大多数KV系统一样，LevelDb的操作接口很简单，基本操作包括写记录，读记录以及删除记录。也支持针对多条操作的原子批量操作。

　　　　另外，LevelDb支持数据快照（snapshot）功能，使得读取操作不受写操作影响，可以在读操作过程中始终看到一致的数据。

　　除此外，LevelDb还支持**数据压缩**等操作，这对于**减小存储空间**以及**增快IO效率**都有直接的帮助。

